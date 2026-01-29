import * as bcrypt from 'bcrypt';

const TOKEN_SALT_ROUNDS = 12;

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, TOKEN_SALT_ROUNDS);
}

export async function verifyToken(token: string, tokenHash: string): Promise<boolean> {
  return bcrypt.compare(token, tokenHash);
}
