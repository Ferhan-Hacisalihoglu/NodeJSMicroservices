import {Pool} from 'pg'

let pool : Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;

        if (connectionString) {
            pool = new Pool({ connectionString });
        } else {
            pool = new Pool({
                host: process.env.POSTGRES_HOST,
                port: Number(process.env.POSTGRES_PORT),
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DB,
            });
        }
    }
    return pool;
}

export async function closePool(): Promise<void> {
    
    if (pool)
    {
        await pool.end();
        pool = null;
    }


}
