CREATE TABLE Cliente (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR (80) NOT NULL,
    email VARCHAR (120) NOT NULL,
    endereco VARCHAR (100) NOT NULL,
    telefone VARCHAR (20) NOT NULL,
    cpf VARCHAR (11),
    status_cliente BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Produto (
    id_produto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_produto VARCHAR(80) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    disponibilidade VARCHAR(12) NOT NULL,
    cod_produto INTEGER NOT NULL
);

CREATE SEQUENCE IF NOT EXISTS seq_cod_produto START WITH 1;
CREATE SEQUENCE IF NOT EXISTS seq_cod_pedido START WITH 1;

CREATE TABLE Pedido (
    id_pedido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    data_pedido DATE NOT NULL,
    valor_total DECIMAL (10,2) NOT NULL,
    status_pedido VARCHAR (30) NOT NULL,
    forma_pagamento VARCHAR (20),
    pago BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_produto) REFERENCES Produto (id_produto)
);

ALTER TABLE cliente ADD COLUMN IF NOT EXISTS status_cliente BOOLEAN NOT NULL DEFAULT TRUE;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pedido' AND column_name = 'status'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pedido' AND column_name = 'status_pedido'
    ) THEN
        ALTER TABLE pedido RENAME COLUMN status TO status_pedido;
    END IF;
END $$;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS status_pedido VARCHAR(30);
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(20);
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS pago BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE Produto ADD COLUMN IF NOT EXISTS cod_produto INT;
ALTER TABLE Pedido ADD COLUMN IF NOT EXISTS cod_pedido INT;
ALTER TABLE Cliente ADD COLUMN IF NOT EXISTS email VARCHAR(120);

-- Preserva registros antigos sem e-mail, atribuindo um identificador técnico antes de exigir o campo.
UPDATE cliente
SET email = 'sem-email+' || id_cliente || '@invalid.local'
WHERE email IS NULL OR BTRIM(email) = '';
UPDATE cliente SET status_cliente = TRUE WHERE status_cliente IS NULL;
ALTER TABLE cliente ALTER COLUMN email SET NOT NULL;

UPDATE pedido SET quantidade = 1 WHERE quantidade IS NULL OR quantidade <= 0;
UPDATE pedido SET pago = FALSE WHERE pago IS NULL;
UPDATE pedido SET status_pedido = 'Aguardando pagamento' WHERE status_pedido IS NULL OR BTRIM(status_pedido) = '';
ALTER TABLE pedido
    ALTER COLUMN id_cliente SET NOT NULL,
    ALTER COLUMN id_produto SET NOT NULL,
    ALTER COLUMN quantidade SET NOT NULL,
    ALTER COLUMN data_pedido SET NOT NULL,
    ALTER COLUMN valor_total SET NOT NULL,
    ALTER COLUMN status_pedido SET NOT NULL,
    ALTER COLUMN pago SET NOT NULL;

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


UPDATE produto SET cod_produto = nextval('seq_cod_produto') WHERE cod_produto IS NULL;
UPDATE pedido SET cod_pedido = nextval('seq_cod_pedido') WHERE cod_pedido IS NULL;
SELECT setval('seq_cod_produto', COALESCE(MAX(cod_produto), 1), MAX(cod_produto) IS NOT NULL) FROM produto;
SELECT setval('seq_cod_pedido', COALESCE(MAX(cod_pedido), 1), MAX(cod_pedido) IS NOT NULL) FROM pedido;


CREATE OR REPLACE FUNCTION gerar_cod_produto()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.cod_produto IS NULL THEN
        NEW.cod_produto := nextval('seq_cod_produto');
    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cadastrar_pedido_validado(
    p_id_cliente INTEGER,
    p_id_produto INTEGER,
    p_data_pedido DATE,
    p_valor_total DECIMAL(10,2),
    p_forma_pagamento VARCHAR(20),
    p_pago BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER AS $$
DECLARE
    v_id_pedido INTEGER;
    v_disponibilidade VARCHAR(12);
BEGIN
    IF p_valor_total < 15 THEN
        RAISE EXCEPTION 'Pedido não finalizado. O valor mínimo para pedidos é de R$15,00.';
    END IF;

    SELECT disponibilidade INTO v_disponibilidade
    FROM produto
    WHERE id_produto = p_id_produto;

    IF NOT FOUND OR LOWER(v_disponibilidade) NOT IN ('disponível', 'disponivel') THEN
        RAISE EXCEPTION 'Produto indisponível no momento. Por favor, escolha outro item do cardápio.';
    END IF;

    IF p_forma_pagamento NOT IN ('dinheiro', 'cartao', 'pix') THEN
        RAISE EXCEPTION 'Selecione uma forma de pagamento válida.';
    END IF;

    INSERT INTO pedido (
        id_cliente, id_produto, data_pedido, valor_total,
        status_pedido, forma_pagamento, pago
    ) VALUES (
        p_id_cliente, p_id_produto, p_data_pedido, p_valor_total,
        CASE WHEN p_pago THEN 'Em preparo' ELSE 'Aguardando pagamento' END,
        p_forma_pagamento, p_pago
    )
    RETURNING id_pedido INTO v_id_pedido;

    RETURN v_id_pedido;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_cod_produto ON produto;

CREATE TRIGGER trigger_cod_produto
BEFORE INSERT ON Produto
FOR EACH ROW
EXECUTE FUNCTION gerar_cod_produto();


CREATE OR REPLACE FUNCTION gerar_cod_pedido()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.cod_pedido IS NULL THEN
        NEW.cod_pedido := nextval('seq_cod_pedido');
    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_cod_pedido ON pedido;

CREATE TRIGGER trigger_cod_pedido
BEFORE INSERT ON Pedido
FOR EACH ROW
EXECUTE FUNCTION gerar_cod_pedido();


ALTER TABLE produto ALTER COLUMN cod_produto SET NOT NULL;
ALTER TABLE pedido ALTER COLUMN cod_pedido SET NOT NULL;

-- CHECKs NOT VALID mantêm os registros históricos e validam todas as novas gravações/alterações.
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

INSERT INTO Cliente (nome, email, endereco, telefone, cpf) 
VALUES
('Ana Souza', 'ana.souza@email.com', 'Rua das Flores, 120 - Centro', '13998123456', '12345678901'),
('Carlos Mendes', 'carlos.mendes@email.com', 'Av Brasil, 450 - Jardim América', '13997456789', '23456789012'),
('Juliana Lima', 'juliana.lima@email.com', 'Rua São Pedro, 78 - Vila Nova', '13998877665', '34567890123'),
('Marcos Oliveira', 'marcos.oliveira@email.com', 'Rua das Palmeiras, 300 - Centro', '13997766554', '45678901234'),
('Fernanda Rocha', 'fernanda.rocha@email.com', 'Av Santos Dumont, 89 - Jardim Bela Vista', '13996655443', '56789012345'),
('Ricardo Alves', 'ricardo.alves@email.com', 'Rua XV de Novembro, 210 - Centro', '13995544332', '67890123456'),
('Patrícia Gomes', 'patricia.gomes@email.com', 'Rua do Comércio, 145 - Vila Rica', '13994433221', '78901234567'),
('Lucas Ferreira', 'lucas.ferreira@email.com', 'Av Padre Anchieta, 560 - Centro', '13993322110', '89012345678'),
('Camila Santos', 'camila.santos@email.com', 'Rua Antônio Prado, 67 - Jardim Europa', '13992211009', '90123456789'),
('Bruno Costa', 'bruno.costa@email.com', 'Rua das Acácias, 400 - Vila Atlântica', '13991100998', '01234567890');


UPDATE cliente
SET email = 'ana.souza@email.com'
WHERE id_cliente = 1;

UPDATE cliente
SET email = 'carlos.mendes@email.com'
WHERE id_cliente = 2;

UPDATE cliente
SET email = 'juliana.lima@email.com'
WHERE id_cliente = 3;

UPDATE cliente
SET email = 'marcos.oliveira@email.com'
WHERE id_cliente = 4;

UPDATE cliente
SET email = 'fernanda.rocha@email.com'
WHERE id_cliente = 5;

UPDATE cliente
SET email = 'ricardo.alves@email.com'
WHERE id_cliente = 6;

UPDATE cliente
SET email = 'patricia.gomes@email.com'
WHERE id_cliente = 7;

UPDATE cliente
SET email = 'lucas.ferreira@email.com'
WHERE id_cliente = 8;

UPDATE cliente 
SET email = 'camila.santos@email.com'
WHERE id_cliente = 9;

UPDATE cliente
SET email = 'bruno.costa@email.com'
WHERE id_cliente = 10;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

INSERT INTO usuario (nome, email, senha, role)
VALUES ('Admin', 'admin@email.com', '1234', 'admin');

