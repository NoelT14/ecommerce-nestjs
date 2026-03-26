import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

//allows both auth users and guests
@Injectable()
export class JwtAnyGuard extends AuthGuard(['jwt', 'jwt-guest']) {
    handleRequest(error: any, user: any) {
        if (error || !user) return null;

        return user
    }
}
