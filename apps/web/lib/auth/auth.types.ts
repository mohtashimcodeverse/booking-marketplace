export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface AuthMeResponse {
  user: AuthUser;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string; // ✅ per your OAS
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
