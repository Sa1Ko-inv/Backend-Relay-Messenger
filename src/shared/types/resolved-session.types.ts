import type { User } from '@prisma/client';

export interface ResolvedSession {
   user: User;
   sessionId: string;
}
