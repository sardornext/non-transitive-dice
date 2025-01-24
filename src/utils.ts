import { createHmac, randomBytes } from 'crypto';
import { SECRET_KEY_LENGTH } from './config';

export function getSecureRandomInt(min: number, max: number): number {
  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValid = Math.floor(256 ** bytesNeeded / range) * range - 1;

  while (true) {
    const bytes = randomBytes(bytesNeeded);
    const value = bytes.reduce((acc, byte) => (acc << 8) + byte, 0);
    if (value <= maxValid) {
      return min + (value % range);
    }
  }
}

export function generateHmac(key: string, message: string): string {
  const hmac = createHmac('sha3-256', key);
  hmac.update(message);
  return hmac.digest('hex');
}

export function generateSecureKey(): string {
  return randomBytes(SECRET_KEY_LENGTH).toString('hex');
}
// export function generateHmac(secretKey: string, message: string): string {
//   return createHmac('sha3-256', secretKey).update(message).digest('hex');
// }

// export function generateSecureKey(): string {
//   return randomBytes(SECRET_KEY_LENGTH).toString('hex');
// }

export function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}
