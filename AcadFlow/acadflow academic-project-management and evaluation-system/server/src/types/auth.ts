import { Role, UserStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  departmentId: string | null;
  departmentCode?: string;
  departmentName?: string;
}

export interface SessionUserData {
  id: string;
  email: string;
  name: string;
  role: Role;
  departmentId: string | null;
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUserData;
  }
}
