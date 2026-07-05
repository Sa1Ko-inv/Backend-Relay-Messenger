import {
   type CanActivate,
   type ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthSessionService } from '@/src/modules/auth/auth-session.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
   public constructor(private readonly authSessionService: AuthSessionService) {}

   public async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;

      const { user, sessionId } =
         await this.authSessionService.resolveSessionFromRequest(request);

      request.user = user;
      request._bearerSessionId = sessionId;

      return true;
   }
}
