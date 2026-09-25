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
            const codigo = error instanceof Error && 'code' in error
                ? String((error as Error & { code?: string }).code)
                : 'desconhecido';
            if (codigo === '28P01') {
                console.error('Falha no PostgreSQL: DB_PASSWORD não corresponde ao usuário DB_USER configurado no .env.');
            } else {
                console.error(`Falha ao conectar ao PostgreSQL (código ${codigo}).`);
            }
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

    public async ensurePedidoSchema(): Promise<void> {
        await this._pool.query(`
            ALTER TABLE cliente
                ADD COLUMN IF NOT EXISTS status_cliente BOOLEAN NOT NULL DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS email VARCHAR(120);

            UPDATE cliente
            SET email = 'sem-email+' || id_cliente || '@invalid.local'
            WHERE email IS NULL OR BTRIM(email) = '';
            UPDATE cliente SET status_cliente = TRUE WHERE status_cliente IS NULL;

            ALTER TABLE cliente
                ALTER COLUMN nome SET NOT NULL,
                ALTER COLUMN email SET NOT NULL,
                ALTER COLUMN endereco SET NOT NULL,
                ALTER COLUMN telefone SET NOT NULL,
                ALTER COLUMN status_cliente SET NOT NULL;

            CREATE SEQUENCE IF NOT EXISTS seq_cod_produto START WITH 1;
            CREATE SEQUENCE IF NOT EXISTS seq_cod_pedido START WITH 1;

            ALTER TABLE produto
                ADD COLUMN IF NOT EXISTS cod_produto INTEGER;

            ALTER TABLE pedido
                ADD COLUMN IF NOT EXISTS cod_pedido INTEGER;

            UPDATE produto SET cod_produto = nextval('seq_cod_produto') WHERE cod_produto IS NULL;
            UPDATE pedido SET cod_pedido = nextval('seq_cod_pedido') WHERE cod_pedido IS NULL;

            SELECT setval('seq_cod_produto', COALESCE(MAX(cod_produto), 1), MAX(cod_produto) IS NOT NULL) FROM produto;
            SELECT setval('seq_cod_pedido', COALESCE(MAX(cod_pedido), 1), MAX(cod_pedido) IS NOT NULL) FROM pedido;

            ALTER TABLE produto
                ALTER COLUMN nome_produto SET NOT NULL,
                ALTER COLUMN preco SET NOT NULL,
                ALTER COLUMN disponibilidade SET NOT NULL,
                ALTER COLUMN cod_produto SET DEFAULT nextval('seq_cod_produto'),
                ALTER COLUMN cod_produto SET NOT NULL;

            ALTER TABLE pedido
                ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1,
                ADD COLUMN IF NOT EXISTS status_pedido VARCHAR(30),
                ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(20),
                ADD COLUMN IF NOT EXISTS pago BOOLEAN NOT NULL DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS cod_pedido INTEGER;

            DROP VIEW IF EXISTS vw_pedidos_completos_baixo;
            DROP VIEW IF EXISTS vw_pedidos_completos;

            ALTER TABLE pedido
                ALTER COLUMN status_pedido TYPE VARCHAR(30);

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'pedido' AND column_name = 'status'
                ) THEN
                    UPDATE pedido
                    SET status_pedido = COALESCE(status_pedido, status)
                    WHERE status_pedido IS NULL;
                END IF;
            END $$;

            UPDATE pedido
            SET quantidade = 1
            WHERE quantidade IS NULL OR quantidade <= 0;

            UPDATE pedido
            SET status_pedido = 'Aguardando pagamento'
            WHERE status_pedido IS NULL;
            UPDATE pedido SET pago = FALSE WHERE pago IS NULL;

            ALTER TABLE pedido
                ALTER COLUMN id_cliente SET NOT NULL,
                ALTER COLUMN id_produto SET NOT NULL,
                ALTER COLUMN quantidade SET NOT NULL,
                ALTER COLUMN data_pedido SET NOT NULL,
                ALTER COLUMN valor_total SET NOT NULL,
                ALTER COLUMN status_pedido SET NOT NULL,
                ALTER COLUMN pago SET NOT NULL,
                ALTER COLUMN cod_pedido SET DEFAULT nextval('seq_cod_pedido'),
                ALTER COLUMN cod_pedido SET NOT NULL;

            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cliente_nome_nao_vazio') THEN
                    ALTER TABLE cliente ADD CONSTRAINT cliente_nome_nao_vazio CHECK (BTRIM(nome) <> '') NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cliente_email_nao_vazio') THEN
                    ALTER TABLE cliente ADD CONSTRAINT cliente_email_nao_vazio CHECK (BTRIM(email) <> '') NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cliente_endereco_nao_vazio') THEN
                    ALTER TABLE cliente ADD CONSTRAINT cliente_endereco_nao_vazio CHECK (BTRIM(endereco) <> '') NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cliente_telefone_formato') THEN
                    ALTER TABLE cliente ADD CONSTRAINT cliente_telefone_formato CHECK (telefone ~ '^[0-9]{10,11}$') NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'produto_nome_nao_vazio') THEN
                    ALTER TABLE produto ADD CONSTRAINT produto_nome_nao_vazio CHECK (BTRIM(nome_produto) <> '') NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'produto_preco_nao_negativo') THEN
                    ALTER TABLE produto ADD CONSTRAINT produto_preco_nao_negativo CHECK (preco >= 0) NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'produto_disponibilidade_valida') THEN
                    ALTER TABLE produto ADD CONSTRAINT produto_disponibilidade_valida CHECK (LOWER(disponibilidade) IN ('disponível', 'indisponível', 'disponivel', 'indisponivel')) NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pedido_status_nao_vazio') THEN
                    ALTER TABLE pedido ADD CONSTRAINT pedido_status_nao_vazio CHECK (BTRIM(status_pedido) <> '') NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pedido_quantidade_positiva') THEN
                    ALTER TABLE pedido ADD CONSTRAINT pedido_quantidade_positiva CHECK (quantidade > 0) NOT VALID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pedido_valor_minimo') THEN
                    ALTER TABLE pedido ADD CONSTRAINT pedido_valor_minimo CHECK (valor_total >= 15) NOT VALID;
                END IF;
            END $$;

            CREATE OR REPLACE VIEW vw_pedidos_completos AS
            SELECT
                pe.id_pedido,
                pe.id_cliente,
                cl.nome AS nome_cliente,
                pe.id_produto,
                pe.quantidade,
                pr.nome_produto,
                pr.preco AS preco_unitario,
                pe.data_pedido,
                pe.valor_total,
                pe.status_pedido,
                pe.forma_pagamento,
                pe.pago
            FROM pedido pe
            JOIN cliente cl ON cl.id_cliente = pe.id_cliente
            JOIN produto pr ON pr.id_produto = pe.id_produto;

            CREATE OR REPLACE VIEW vw_pedidos_completos_baixo AS
            SELECT * FROM vw_pedidos_completos
            WHERE LOWER(nome_produto) LIKE '%indispon%';
        `);

        console.log('Schema de pedidos verificado.');
    }

    public get pool() {
        return this._pool;
    }
}