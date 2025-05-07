import { User } from "./user";

export interface UserWithStatus extends User {
  status?: { name: string } | string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: T;
}

export type FormState = {
  _id?: string;
  name: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
};

export interface LoginResponse {
  data: {
    token: string;
  };
}
