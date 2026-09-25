BEGIN;

ALTER TABLE cliente
    ADD COLUMN IF NOT EXISTS status_cliente BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS cod_pedido INTEGER;

ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;

UPDATE pedido SET quantidade = 1 WHERE quantidade IS NULL OR quantidade <= 0;

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
