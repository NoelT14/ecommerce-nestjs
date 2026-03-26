import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


export interface GuestPayload {
    guestId: string;
    isGuest: true;
}

@Injectable()
export class JwtGuestStrategy extends PassportStrategy(Strategy, 'jwt-guest') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_GUEST_SECRET')
        })
    }

    validate(payload: GuestPayload) {
        return payload//stateless
    }
}
