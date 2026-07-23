import { randomBytes } from 'node:crypto';

export function generateInviteCode(length: number = 16): string {
   // base64url кодирует 3 байта в 4 символа,
   // поэтому берём с запасом и обрезаем до нужной длины
   const bytesNeeded = Math.ceil((length * 3) / 4);
   const code = randomBytes(bytesNeeded).toString('base64url').slice(0, length);

   return code;
}