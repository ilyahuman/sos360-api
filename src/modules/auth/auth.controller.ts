import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from '@/api/types/requests.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body as LoginRequest);
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body as RegisterRequest);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: result,
    });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'Password reset endpoint - implementation pending' });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'Token refresh endpoint - implementation pending' });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'Logout endpoint - implementation pending' });
  };
}
