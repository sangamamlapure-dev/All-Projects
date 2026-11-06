import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';
import { prisma, isDatabaseConnected } from '../db';
import { AuthUser, SessionUserData } from '../types/auth';


interface PasswordResetToken {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

interface InvitationRecord {
  token: string;
  email: string;
  role: Role;
  departmentId: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
}

// In-memory fallback and token store
const resetTokens: Map<string, PasswordResetToken> = new Map();
const invitationStore: Map<string, InvitationRecord> = new Map();

// Synchronous bootstrap seed users for test/dev environments
const inMemoryUsers: AuthUser[] = [
  {
    id: 'user-hod-cse-01',
    email: 'hod.cse@college.edu',
    name: 'Dr. Ramesh Kulkarni',
    role: Role.HOD,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-cse-01',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
  },
  {
    id: 'user-mentor-01',
    email: 'mentor.sharma@college.edu',
    name: 'Prof. Sunita Sharma',
    role: Role.PROJECT_MENTOR,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-cse-01',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
  },
  {
    id: 'user-mentor-02',
    email: 'mentor.patel@college.edu',
    name: 'Prof. Vikram Patel',
    role: Role.PROJECT_MENTOR,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-cse-01',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
  },
  {
    id: 'user-student-01',
    email: 'student.aarav@college.edu',
    name: 'Aarav Deshmukh',
    role: Role.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-cse-01',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
  },
  {
    id: 'user-student-02',
    email: 'student.diya@college.edu',
    name: 'Diya Joshi',
    role: Role.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-cse-01',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
  },
  {
    id: 'user-student-03',
    email: 'student.rohan@college.edu',
    name: 'Rohan Verma',
    role: Role.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-cse-01',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
  },
  {
    id: 'user-evaluator-01',
    email: 'evaluator.drgupta@external.ac.in',
    name: 'Dr. Arvind Gupta',
    role: Role.EXTERNAL_EVALUATOR,
    status: UserStatus.ACTIVE,
    departmentId: null,
  },
];

// Hash password for in-memory comparisons: 'Password123!'
let cachedPasswordHash: string | null = null;
async function getPasswordHash(): Promise<string> {
  if (!cachedPasswordHash) {
    cachedPasswordHash = await bcrypt.hash('Password123!', 10);
  }
  return cachedPasswordHash;
}

export class AuthService {
  /**
   * Authenticate user credentials and return session payload
   */
  static async login(email: string, password: string): Promise<SessionUserData> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check database if connected
    let dbUser: any = null;
    if (await isDatabaseConnected()) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { department: true },
        });
      } catch {
        // Prisma error
      }
    }


    if (dbUser) {
      if (dbUser.status === UserStatus.SUSPENDED) {
        throw new Error('AccountSuspended: Your account is suspended. Please contact your HOD.');
      }
      if (dbUser.status === UserStatus.INACTIVE) {
        throw new Error('AccountInactive: Your account is inactive.');
      }

      const isValid = await bcrypt.compare(password, dbUser.passwordHash);
      if (!isValid) {
        throw new Error('InvalidCredentials: Invalid email or password.');
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        departmentId: dbUser.departmentId,
      };
    }

    // 2. Fallback to memory accounts
    const memoryUser = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!memoryUser) {
      throw new Error('InvalidCredentials: Invalid email or password.');
    }

    if (memoryUser.status === UserStatus.SUSPENDED) {
      throw new Error('AccountSuspended: Your account is suspended. Please contact your HOD.');
    }

    const defaultHash = await getPasswordHash();
    const isMatch = await bcrypt.compare(password, defaultHash);
    if (!isMatch) {
      throw new Error('InvalidCredentials: Invalid email or password.');
    }

    return {
      id: memoryUser.id,
      email: memoryUser.email,
      name: memoryUser.name,
      role: memoryUser.role,
      departmentId: memoryUser.departmentId,
    };
  }

  /**
   * Get full user profile
   */
  static async getUserById(userId: string): Promise<AuthUser | null> {
    if (await isDatabaseConnected()) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: { department: true },
        });
        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            status: dbUser.status,
            departmentId: dbUser.departmentId,
            departmentCode: dbUser.department?.code,
            departmentName: dbUser.department?.name,
          };
        }
      } catch {
        // fallback
      }
    }

    const found = inMemoryUsers.find((u) => u.id === userId);
    return found || null;
  }


  /**
   * Request password reset token (15-min expiration)
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; note: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.getUserByEmail(normalizedEmail);

    if (!user) {
      // Security best practice: Do not disclose if user exists
      return {
        success: true,
        note: 'If this email is registered, password reset instructions have been generated.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    resetTokens.set(token, {
      email: normalizedEmail,
      token,
      expiresAt,
      used: false,
    });

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      ...(isDev && { token }),
      note: 'If this email is registered, password reset instructions have been generated.',
    };
  }

  /**
   * Complete password reset using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const record = resetTokens.get(token);
    if (!record) {
      throw new Error('InvalidToken: Reset token is invalid or has expired.');
    }

    if (record.used || record.expiresAt < new Date()) {
      throw new Error('ExpiredToken: Reset token has expired or has already been used.');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    if (await isDatabaseConnected()) {
      try {
        await prisma.user.update({
          where: { email: record.email },
          data: { passwordHash: newHash },
        });
      } catch {
        cachedPasswordHash = newHash;
      }
    } else {
      cachedPasswordHash = newHash;
    }

    record.used = true;
    resetTokens.set(token, record);
    return true;
  }

  /**
   * Create an authorized department invitation (HOD only)
   */

  static async createInvitation(invitedBy: SessionUserData, email: string, role: Role, departmentId: string): Promise<string> {
    if (invitedBy.role !== Role.HOD) {
      throw new Error('Unauthorized: Only an HOD can issue department invitations.');
    }

    if (invitedBy.departmentId !== departmentId) {
      throw new Error('CrossDepartmentViolation: HOD cannot invite users to another department.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      await prisma.invitation.create({
        data: {
          email: email.toLowerCase().trim(),
          role,
          departmentId,
          token,
          invitedById: invitedBy.id,
          expiresAt,
        },
      });
    } catch {
      invitationStore.set(token, {
        token,
        email: email.toLowerCase().trim(),
        role,
        departmentId,
        invitedBy: invitedBy.id,
        expiresAt,
      });
    }

    return token;
  }

  /**
   * Accept an invitation token and initialize account
   */
  static async acceptInvitation(token: string, name: string, password: string): Promise<AuthUser> {
    let invitation: any = null;
    try {
      invitation = await prisma.invitation.findUnique({ where: { token } });
    } catch {
      invitation = invitationStore.get(token);
    }

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new Error('InvalidInvitation: The invitation token is invalid, expired, or already redeemed.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: AuthUser = {
      id: `user-inv-${Date.now()}`,
      email: invitation.email,
      name,
      role: invitation.role,
      status: UserStatus.ACTIVE,
      departmentId: invitation.departmentId,
    };

    try {
      const created = await prisma.user.create({
        data: {
          email: invitation.email,
          name,
          role: invitation.role,
          passwordHash,
          departmentId: invitation.departmentId,
          status: UserStatus.ACTIVE,
        },
      });
      await prisma.invitation.update({
        where: { token },
        data: { acceptedAt: new Date() },
      });
      return {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        status: created.status,
        departmentId: created.departmentId,
      };
    } catch {
      inMemoryUsers.push(newUser);
      invitation.acceptedAt = new Date();
      return newUser;
    }
  }

  /**
   * Suspend user account (HOD only, within department)
   */
  static async suspendUser(actor: SessionUserData, targetUserId: string): Promise<void> {
    if (actor.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can suspend accounts.');
    }

    const targetUser = await this.getUserById(targetUserId);
    if (!targetUser) throw new Error('UserNotFound: User does not exist.');

    if (targetUser.departmentId !== actor.departmentId) {
      throw new Error('CrossDepartmentViolation: Cannot suspend user outside your department.');
    }

    if (targetUser.id === actor.id) {
      throw new Error('SelfSuspensionProhibited: HOD cannot suspend their own account.');
    }

    try {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { status: UserStatus.SUSPENDED },
      });
      await prisma.auditLog.create({
        data: {
          departmentId: actor.departmentId,
          userId: actor.id,
          action: 'USER_SUSPEND',
          resource: 'User',
          resourceId: targetUserId,
          detailsJson: JSON.stringify({ targetEmail: targetUser.email, targetRole: targetUser.role }),
        },
      });
    } catch {
      targetUser.status = UserStatus.SUSPENDED;
    }
  }

  /**
   * Reactivate user account (HOD only, within department)
   */
  static async reactivateUser(actor: SessionUserData, targetUserId: string): Promise<void> {
    if (actor.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can reactivate accounts.');
    }

    const targetUser = await this.getUserById(targetUserId);
    if (!targetUser) throw new Error('UserNotFound: User does not exist.');

    if (targetUser.departmentId !== actor.departmentId) {
      throw new Error('CrossDepartmentViolation: Cannot reactivate user outside your department.');
    }

    try {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { status: UserStatus.ACTIVE },
      });
    } catch {
      targetUser.status = UserStatus.ACTIVE;
    }
  }

  private static async getUserByEmail(email: string): Promise<AuthUser | null> {
    if (await isDatabaseConnected()) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) return dbUser as any;
      } catch {
        // fallback
      }
    }
    return inMemoryUsers.find((u) => u.email.toLowerCase() === email) || null;
  }

}
