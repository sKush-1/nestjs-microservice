import { createClerkClient, verifyToken } from "@clerk/backend";
import { Injectable } from "@nestjs/common";
import { UserContext } from "./auth.types";

type ClerkTokenPayload = {
    sub?: string;
    userId?: string;
    email?: string;
    emailAddress?: string;
    primaryEmailAddress?: string;
    name?: string;
    fullName?: string;
    username?: string;
    [key: string]: any;
};

@Injectable()
export class AuthService {
    private readonly clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    })

    private jwtVerifyOptions() : Record<string, any> {
        return {
            secretKey: process.env.CLERK_SECRET_KEY,
        }
    }

    async verifyAndBuildContext(token: string): Promise<UserContext> {
        try {
            const verified = await verifyToken(token, this.jwtVerifyOptions());
            const payload = (verified?.payload ?? verified) as ClerkTokenPayload;
            const clerkUserId = payload?.sub ?? payload?.userId;

            if(!clerkUserId) {
                throw new Error("Invalid user context");
            }

            const role : 'user' | 'admin' = 'user';

            const emailFromToken = payload?.email ?? payload?.emailAddress ?? payload?.primaryEmailAddress?? '';
            const nameFromToken = payload?.name ?? payload?.fullName ?? payload?.username ?? '';

            if(emailFromToken || nameFromToken) {
                  return {
                clerkUserId,
                role,
                email: emailFromToken,
                name: nameFromToken
            };
            }

            const clerkUser = await this.clerk.users.getUser(clerkUserId);
            const primaryEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId) ?? clerkUser.emailAddresses[0];
            const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || '';

            return {
                clerkUserId,
                role,
                email: primaryEmail?.emailAddress ?? '',
                name: fullName
            };

          

        } catch (error) {
            throw new Error("Failed to verify user context");
        }
    }
}