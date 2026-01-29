import { randomBytes } from 'crypto';

export function generateRandomToken(bytes = 48): string {
  return randomBytes(bytes).toString('hex');
}
