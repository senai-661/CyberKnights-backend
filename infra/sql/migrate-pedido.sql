BEGIN;

ALTER TABLE cliente
    ADD COLUMN IF NOT EXISTS status_cliente BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE cliente
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

ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;

UPDATE pedido SET quantidade = 1 WHERE quantidade IS NULL OR quantidade <= 0;
UPDATE pedido SET pago = FALSE WHERE pago IS NULL;

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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pedido_quantidade_positiva'
    ) THEN
        ALTER TABLE pedido ADD CONSTRAINT pedido_quantidade_positiva CHECK (quantidade > 0);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pedido' AND column_name = 'status'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pedido' AND column_name = 'status_pedido'
    ) THEN
        ALTER TABLE pedido RENAME COLUMN status TO status_pedido;
    END IF;
END $$;

ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS status_pedido VARCHAR(30);

DROP VIEW IF EXISTS vw_pedidos_completos_baixo;
DROP VIEW IF EXISTS vw_pedidos_completos;

ALTER TABLE pedido
    ALTER COLUMN status_pedido TYPE VARCHAR(30);

ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(20);

ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS pago BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE pedido
SET status_pedido = COALESCE(status_pedido, 'Aguardando pagamento')
WHERE status_pedido IS NULL;

ALTER TABLE pedido
    ALTER COLUMN status_pedido SET NOT NULL;

ALTER TABLE pedido
    ALTER COLUMN id_cliente SET NOT NULL,
    ALTER COLUMN id_produto SET NOT NULL,
    ALTER COLUMN quantidade SET NOT NULL,
    ALTER COLUMN data_pedido SET NOT NULL,
    ALTER COLUMN valor_total SET NOT NULL,
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
SELECT *
FROM vw_pedidos_completos
WHERE LOWER(nome_produto) LIKE '%indispon%';

COMMIT;
