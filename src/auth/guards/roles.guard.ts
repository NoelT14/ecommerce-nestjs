import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "../enums/role.enum";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])//merr metadata (roles)

        if (!required) return true;//no @Roles , lejo requestin

        const { user } = context.switchToHttp().getRequest();
        if (!user?.role) throw new ForbiddenException();

        return required.includes(user.role);//kontrolli autorizimit
    }
}
