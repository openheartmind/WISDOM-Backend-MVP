// get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { roles } from 'src/instance/instance.roles';

export const GetRole = createParamDecorator(
  (data: keyof roles, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.role?.[data];
    }
    return request.role;
  },
);
