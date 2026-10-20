

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type User = {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    created_at: Date;
}

export type JWTPayload = {
    userId: string;
    role: UserRole;
}
