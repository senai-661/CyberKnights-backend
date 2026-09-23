import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
export class DatabaseModel {

    private _config: pg.PoolConfig;
    private _pool: pg.Pool;
    private _client: pg.Client;
    constructor() {
        const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
        this._config = {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'cyberknights',
            password: process.env.DB_PASSWORD || 'postgres',
            port,
            max: 10,
            idleTimeoutMillis: 10000
        };

        if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD) {
            console.warn('WARNING: Missing one or more DB_ environment variables. Using default DB config: postgres@localhost:5432/cyberknights. Create a .env file to customize these settings.');
        }

        this._pool = new pg.Pool(this._config);
        this._client = new pg.Client(this._config);
    }
    public async testeConexao() {
        try {
            await this._client.connect();
            console.log('Database connected!');
            this._client.end();
            return true;
        } catch (error) {
            console.log('Error to connect database X');
            console.log(error);
            this._client.end();
            return false;
        }
    }
    public async ensureUsuarioTable(): Promise<void> {
        try {
            const tableCheck = await this._pool.query("SELECT to_regclass('public.usuario') AS exists");
            const usuarioExists = tableCheck.rows?.[0]?.exists;

            if (!usuarioExists) {
                console.log('Usuario table not found. Creating `usuario` table and seeding admin user...');
                await this._pool.query(`
                    CREATE TABLE IF NOT EXISTS usuario (
                        id_usuario SERIAL PRIMARY KEY,
                        nome VARCHAR(100) NOT NULL,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        senha VARCHAR(100) NOT NULL,
                        role VARCHAR(50) DEFAULT 'user'
                    );
                `);
            }

            const adminCheck = await this._pool.query(
                'SELECT 1 FROM usuario WHERE email=$1 LIMIT 1',
                ['admin@email.com']
            );

            if (adminCheck.rowCount === 0) {
                console.log('Admin user not found. Inserting default admin credentials...');
                await this._pool.query(
                    `INSERT INTO usuario (nome, email, senha, role)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (email) DO NOTHING`,
                    ['Admin', 'admin@email.com', '1234', 'admin']
                );
            }

            console.log('Database schema check completed.');
        } catch (error) {
            console.error('Failed to ensure usuario table:', error);
            throw error;
        }
    }

    public get pool() {
        return this._pool;
    }
}