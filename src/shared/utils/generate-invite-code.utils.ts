import { randomBytes } from 'node:crypto';

export function generateInviteCode(length: number = 12) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

   const randomBytesBuffer = randomBytes(Math.ceil(length / 2));

   let code = '';

   for (let i = 0; i < length; i++) {
      const byteIndex = Math.floor(i / 2);
      const randomByte = randomBytesBuffer[byteIndex];
      const randomIndex = randomByte % chars.length;
      code += chars[randomIndex];
   }

   return code;
}
