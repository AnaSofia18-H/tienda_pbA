import { SetMetadata } from '@nestjs/common';

// Llave con la que se guarda la metadata de roles
export const ROLES_KEY = 'roles';

// Uso: @Roles('ADMIN') o @Roles('ADMIN', 'VENDEDOR')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);