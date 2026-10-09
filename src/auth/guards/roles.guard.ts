import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean {
    // 1. Leer con Reflector los roles que puso @Roles() (en el método o en el controlador)
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
    ]);
    // 2. Si el endpoint no tiene @Roles, se deja pasar
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
        return true;
    }
    // 3. Obtener el usuario que dejó el JwtAuthGuard en la request
    const { user } = context.switchToHttp().getRequest();
    
    // 4. Comparar el rol del usuario con los permitidos
    if (!user || !rolesRequeridos.includes(user.rol)) {
        throw new ForbiddenException(
        `Acceso denegado: se requiere rol ${rolesRequeridos.join(' o ')}`,
    );
    }
    return true;
}
}