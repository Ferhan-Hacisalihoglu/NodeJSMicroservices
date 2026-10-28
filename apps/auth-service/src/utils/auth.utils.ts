
import type { User } from "../types/auth.type";

export function convertToPublicUser(user: User){
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
    }
}
