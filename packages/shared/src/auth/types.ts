

export type UserRole = "USER" | "ADMIN";

export type JWTPayload = {
    userId: string;
    role: UserRole;
}

