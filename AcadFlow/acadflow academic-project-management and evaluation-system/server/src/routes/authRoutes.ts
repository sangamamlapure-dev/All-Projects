import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

export const authRouter = Router();

// Rate limiter: Max 10 requests per minute per IP
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please wait 60 seconds before retrying.',
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

const acceptInvitationSchema = z.object({
  token: z.string().min(10, 'Invitation token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

// POST /api/auth/login
authRouter.post('/login', authRateLimiter, async (req: Request, res: Response) => {

  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'ValidationError',
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password } = parseResult.data;
  try {
    const sessionUser = await AuthService.login(email, password);

    // Save to server-side session
    req.session.user = sessionUser;
    req.session.save((err) => {
      if (err) {
        res.status(500).json({ error: 'SessionError', message: 'Failed to establish session.' });
        return;
      }
      res.status(200).json({
        message: 'Login successful.',
        user: sessionUser,
      });
    });
  } catch (err: any) {
    const isSuspended = err.message.startsWith('AccountSuspended');
    const status = isSuspended ? 403 : 401;
    res.status(status).json({
      error: isSuspended ? 'AccountSuspended' : 'Unauthorized',
      message: err.message,
    });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  if (!req.session) {
    res.status(200).json({ message: 'Already logged out.' });
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'SessionError', message: 'Failed to destroy session.' });
      return;
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const sessionUser = req.session.user!;
  const fullProfile = await AuthService.getUserById(sessionUser.id);
  res.status(200).json({
    user: fullProfile || sessionUser,
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', authRateLimiter, async (req: Request, res: Response) => {
  const parseResult = forgotPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'ValidationError',
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const result = await AuthService.requestPasswordReset(parseResult.data.email);
  res.status(200).json(result);
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', authRateLimiter, async (req: Request, res: Response) => {

  const parseResult = resetPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'ValidationError',
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { token, newPassword } = parseResult.data;
    await AuthService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been successfully reset. Please log in.' });
  } catch (err: any) {
    res.status(400).json({ error: 'ResetError', message: err.message });
  }
});

// POST /api/auth/accept-invitation
authRouter.post('/accept-invitation', async (req: Request, res: Response) => {
  const parseResult = acceptInvitationSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'ValidationError',
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { token, name, password } = parseResult.data;
    const user = await AuthService.acceptInvitation(token, name, password);
    res.status(201).json({
      message: 'Invitation accepted and account activated.',
      user,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'InvitationError', message: err.message });
  }
});
