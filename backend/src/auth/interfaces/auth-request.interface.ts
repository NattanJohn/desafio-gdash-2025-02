import { Request } from 'express';

interface UserForAuth {
  _id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user: UserForAuth;
}
