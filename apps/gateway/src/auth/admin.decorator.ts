import { SetMetadata } from "@nestjs/common";

export const REQUIRED_ROLE_KEY = 'requiredRole';

export const AdminOnly = (role: 'admin' | 'user') => SetMetadata(REQUIRED_ROLE_KEY, role);