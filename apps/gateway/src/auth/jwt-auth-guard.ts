import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor (
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if(isPublic) {
            return true;
        }

        const req = context.switchToHttp().getRequest() as any;
        const authorization = req.headers['authorization'];

        if(!authorization || typeof authorization !== 'string') {
            throw new UnauthorizedException("Missing authorization header");    
        }
        
        const token = authorization.startsWith('Bearer')?authorization.slice('Bearer '.length).trim():authorization.trim();

        if(!token){
            throw new UnauthorizedException("Invalid authorization header format");
        }

        const identifyAuthUser = await this.authService.verifyAndBuildContext(token);
        
        if(!identifyAuthUser) {
            throw new UnauthorizedException("Invalid token");
        }

        const dbUser = await this.userService.upsertAuthUser({
            clerkUserId: identifyAuthUser.clerkUserId,
            email: identifyAuthUser.email,
            name: identifyAuthUser.name
        });

        if(!dbUser) {
            throw new UnauthorizedException("Failed to upsert user");
        }
        
        const user = {
            ...identifyAuthUser,
            role: dbUser.role
        }
        req.user = user;
        const requiredRole = this.reflector.getAllAndOverride<'admin' | 'user'>('REQUIRED_ROLE_KEY', [
            context.getHandler(),
            context.getClass()
        ]);

        if(requiredRole === 'admin' && user.role !== 'admin') {
            throw new UnauthorizedException("Admin role required");
        }

        return true;
    }
}