import { SetMetadata } from '@nestjs/common';

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'MANAGER' | 'SALESPERSON' | 'TECHNICIAN';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

