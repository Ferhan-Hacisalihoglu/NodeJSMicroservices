import { RegisterInput,LoginInput } from "../schemas/auth.schemas";
import { findByEmail,findById } from "../repositories/user.repo";
import { AppError } from "shared";
import bcrypt from "bcryptjs";
import { createUser } from "../repositories/user.repo";
import { convertToPublicUser } from "../utils/auth.utils";
import { signToken } from "shared";



export async function register(input:RegisterInput){
    const existing = await findByEmail(input.email)

    if(existing){
        throw new AppError("User already exists", 400)
    }

    const passwordHash = await bcrypt.hash(input.password, 10)
    const user = await createUser({
        name: input.name,
        email: input.email,
        passwordHash,
        role: "USER"
    })

    return convertToPublicUser(user);
}

export async function login(input:LoginInput){
    const user = await findByEmail(input.email)

    if(!user){
        throw new AppError("Invalid email or password", 401)
    }

    const valid = await bcrypt.compare(input.password, user.password_hash)

    if(!valid){
        throw new AppError("Invalid email or password", 401)
    }

    const token = signToken({ userId: user.id, role: user.role })

    return {
        token,
        user: convertToPublicUser(user)
    }
}  

export async function getMe(userId: string){
    const user = await findById(userId)

    if (!user) {
        throw new AppError("User not found", 404)
    }

    return convertToPublicUser(user);
}
