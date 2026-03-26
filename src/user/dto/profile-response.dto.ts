import { Role } from "src/auth/enums/role.enum";

export class ProfileResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: Role;
    isEmailVerified: boolean;
    createdAt: Date;
}
