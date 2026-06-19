import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user as {
      userId: string;
      username?: string;
      role: string;
      partnerId?: number;
      email?: string;
    };
  }
);
