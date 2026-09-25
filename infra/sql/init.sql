CREATE TABLE Cliente (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR (80) NOT NULL,
    email VARCHAR (120) NOT NULL,
    endereco VARCHAR (100) NOT NULL,
    telefone VARCHAR (20) NOT NULL,
    cpf VARCHAR (11)
);

CREATE TABLE Produto (
    id_produto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_produto VARCHAR(80) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    disponibilidade VARCHAR(12) NOT NULL,
    cod_produto INTEGER NOT NULL
);

CREATE TABLE Pedido (
    id_pedido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_produto INT NOT NULL,
    data_pedido DATE NOT NULL,
    valor_total DECIMAL (10,2) NOT NULL,
    status_pedido VARCHAR (15) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_produto) REFERENCES Produto (id_produto)
);

CREATE TABLE Usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

    FOREIGN KEY (id_cliente)
        REFERENCES Cliente(id_cliente),

    FOREIGN KEY (id_produto)
        REFERENCES Produto(id_produto)
);

ALTER TABLE Produto ADD COLUMN IF NOT EXISTS cod_produto INT;
ALTER TABLE Pedido ADD COLUMN IF NOT EXISTS cod_pedido INT;
ALTER TABLE Cliente ADD COLUMN IF NOT EXISTS email VARCHAR(120) NOT NULL DEFAULT '';


UPDATE produto SET cod_produto = nextval('seq_cod_produto');
UPDATE pedido SET cod_pedido = nextval('seq_cod_pedido');


CREATE OR REPLACE FUNCTION gerar_cod_produto()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.cod_produto IS NULL THEN
        NEW.cod_produto := nextval('seq_cod_produto');
    END IF;

    RETURN NEW;

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


INSERT INTO Pedido
(id_cliente, id_produto, data_pedido, valor_total, status_pedido)
VALUES
(1, 1, '2026-02-20', 18.90, 'entregue'),
(2, 3, '2026-02-21', 24.90, 'preparando'),
(3, 4, '2026-02-22', 15.00, 'entregue'),
(4, 10, '2026-02-23', 79.90, 'à caminho'),
(5, 2, '2026-02-23', 20.90, 'pedido aceito'),
(6, 6, '2026-02-24', 6.00, 'entregue'),
(7, 9, '2026-02-24', 17.50, 'preparando'),
(8, 7, '2026-02-25', 8.50, 'entregue'),
(9, 1, '2026-02-25', 18.90, 'à caminho'),
(10, 3, '2026-02-25', 24.90, 'pedido aceito');

INSERT INTO Produto (nome_produto, preco, disponibilidade, cod_produto)
VALUES
('X-Burger', 18.90, 'disponível', 11),
('X-Salada', 20.90, 'disponível', 12),
('X-Bacon', 24.90, 'disponível', 13),
('Batata Frita Média', 15.00, 'disponível', 14),
('BATATA FRITA GRANDE', 67.00, 'disponível', 15),
('Refrigerante Lata', 6.00, 'disponível', 16),
('Suco Natural', 8.50, 'disponível', 17),
('Milkshake Chocolate', 16.00, 'indisponível', 18),
('Hot Dog Especial', 17.50, 'disponível', 20),
('Combo Família', 79.90, 'disponível', 22),
('X-TUDO ESPECIAL', 25.90, 'disponível', 24),
('X EGG SALADA', 22.90, 'Disponível', 25),
('X BIG DA CASA', 27.99, 'Disponível', 26);

INSERT INTO usuario (nome, email, senha, role)
VALUES ('Admin', 'admin@email.com', '1234', 'admin');

CREATE OR REPLACE VIEW public.vw_pedidos_detalhados
 AS
 SELECT p.id_pedido,
    c.nome,
    c.telefone,
    pr.nome_produto,
    pr.preco,
    p.data_pedido,
    p.valor_total,
    p.status_pedido
   FROM pedido p
     JOIN cliente c ON p.id_cliente = c.id_cliente
     JOIN produto pr ON p.id_produto = pr.id_produto;

ALTER TABLE public.vw_pedidos_detalhados
    OWNER TO postgres;

ALTER TABLE Cliente
ADD CONSTRAINT unique_email UNIQUE (email);

ALTER TABLE Produto
ADD CONSTRAINT check_preco
CHECK (preco >= 0);

ALTER TABLE Pedido
ADD CONSTRAINT check_status
CHECK (status IN ('entregue', 'preparando', 'à caminho', 'pedido aceito'));

CREATE OR REPLACE FUNCTION padronizar_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.status_pedido := INITCAP(LOWER(NEW.status_pedido));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_padronizar_status ON Pedido;

CREATE TRIGGER trigger_padronizar_status
BEFORE INSERT OR UPDATE ON Pedido
FOR EACH ROW
EXECUTE FUNCTION padronizar_status();

UPDATE Pedido
SET status_pedido = INITCAP(LOWER(status_pedido));

ALTER TABLE Pedido
ADD CONSTRAINT check_status
CHECK (status_pedido IN (
    'Pedido Aceito',
    'Concluído',
    'À Caminho',
    'Preparando',
    'Entregue',
    'Pendente'
));

CREATE OR REPLACE FUNCTION fn_primeira_letra_maiuscula()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome_produto :=
        UPPER(LEFT(TRIM(NEW.nome_produto), 1)) ||
        SUBSTRING(TRIM(NEW.nome_produto) FROM 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_primeira_letra_maiuscula
BEFORE INSERT OR UPDATE ON Produto
FOR EACH ROW
EXECUTE FUNCTION fn_primeira_letra_maiuscula();

UPDATE Produto
SET nome_produto =
    UPPER(LEFT(TRIM(nome_produto), 1)) ||
    SUBSTRING(TRIM(nome_produto) FROM 2);

    UPDATE Produto
SET nome_produto =
    UPPER(LEFT(LOWER(TRIM(nome_produto)), 1)) ||
    SUBSTRING(LOWER(TRIM(nome_produto)) FROM 2);

    UPDATE Cliente
SET nome =
    UPPER(LEFT(LOWER(TRIM(nome)), 1)) ||
    SUBSTRING(LOWER(TRIM(nome)) FROM 2);

    CREATE OR REPLACE FUNCTION fn_primeira_letra_nome_cliente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome :=
        UPPER(LEFT(LOWER(TRIM(NEW.nome)), 1)) ||
        SUBSTRING(LOWER(TRIM(NEW.nome)) FROM 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_primeira_letra_nome_cliente
BEFORE INSERT OR UPDATE ON Cliente
FOR EACH ROW
EXECUTE FUNCTION fn_primeira_letra_nome_cliente();

UPDATE Cliente
SET endereco = INITCAP(TRIM(endereco));

CREATE OR REPLACE FUNCTION fn_primeira_letra_endereco_cliente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.endereco := INITCAP(TRIM(NEW.endereco));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_primeira_letra_endereco_cliente
BEFORE INSERT OR UPDATE ON Cliente
FOR EACH ROW
EXECUTE FUNCTION fn_primeira_letra_endereco_cliente();

UPDATE Produto
SET disponibilidade =
    UPPER(LEFT(LOWER(TRIM(disponibilidade)), 1)) ||
    SUBSTRING(LOWER(TRIM(disponibilidade)) FROM 2);

    CREATE OR REPLACE FUNCTION fn_primeira_letra_disponibilidade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.disponibilidade :=
        UPPER(LEFT(LOWER(TRIM(NEW.disponibilidade)), 1)) ||
        SUBSTRING(LOWER(TRIM(NEW.disponibilidade)) FROM 2);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_primeira_letra_disponibilidade
BEFORE INSERT OR UPDATE ON Produto
FOR EACH ROW
EXECUTE FUNCTION fn_primeira_letra_disponibilidade();

CREATE OR REPLACE PROCEDURE sp_registrar_movimentacao(
    p_id_produto INTEGER,
    p_tipo VARCHAR(10),
    p_motivo VARCHAR(20),
    p_quantidade INTEGER,
    p_preco_unitario_praticado NUMERIC(10, 2),
    p_valor_total NUMERIC(12, 2),
    p_observacao VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_produto_ativo BOOLEAN;
BEGIN

    -- Verifica se o produto existe e está ativo.
    SELECT ativo
    INTO v_produto_ativo
    FROM produto
    WHERE id_produto = p_id_produto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto não encontrado.';
    END IF;

    IF v_produto_ativo = FALSE THEN
        RAISE EXCEPTION 'Não é possível movimentar um produto desativado.';
    END IF;

    -- A quantidade deve ser maior que zero.
    IF p_quantidade <= 0 THEN
        RAISE EXCEPTION 'A quantidade deve ser maior que zero.';
    END IF;

    -- Valida o tipo da movimentação.
    IF p_tipo NOT IN ('ENTRADA', 'SAIDA') THEN
        RAISE EXCEPTION 'Tipo de movimentação inválido.';
    END IF;

    -- Valida o motivo da movimentação.
    IF p_motivo NOT IN (
        'RECEBIMENTO',
        'VENDA',
        'USO_INTERNO',
        'PERDA',
        'DANIFICADO',
        'CORRECAO'
    ) THEN
        RAISE EXCEPTION 'Motivo de movimentação inválido.';
    END IF;

    -- Venda precisa ser uma saída.
    IF p_motivo = 'VENDA' AND p_tipo <> 'SAIDA' THEN
        RAISE EXCEPTION 'Uma venda deve ser uma movimentação de saída.';
    END IF;

    -- Venda precisa possuir preço e valor total.
    IF p_motivo = 'VENDA' THEN

        IF p_preco_unitario_praticado IS NULL THEN
            RAISE EXCEPTION 'Venda deve possuir preço unitário.';
        END IF;

        IF p_valor_total IS NULL THEN
            RAISE EXCEPTION 'Venda deve possuir valor total.';
        END IF;

        IF p_valor_total <> p_quantidade * p_preco_unitario_praticado THEN
            RAISE EXCEPTION 'O valor total da venda está incorreto.';
        END IF;

    END IF;

    -- Os demais tipos não devem possuir dados financeiros.
    IF p_motivo <> 'VENDA' THEN

        IF p_preco_unitario_praticado IS NOT NULL
           OR p_valor_total IS NOT NULL THEN
            RAISE EXCEPTION
                'Somente vendas podem possuir preço unitário e valor total.';
        END IF;

    END IF;

    -- Observação obrigatória.
    IF TRIM(p_observacao) = '' THEN
        RAISE EXCEPTION 'A observação é obrigatória.';
    END IF;

    -- Insere a movimentação.
    -- O trigger tg_atualizar_estoque será acionado
    -- automaticamente e atualizará o estoque do produto.
    INSERT INTO movimentacao (
        id_produto,
        tipo,
        motivo,
        quantidade,
        preco_unitario_praticado,
        valor_total,
        observacao
    )
    VALUES (
        p_id_produto,
        p_tipo,
        p_motivo,
        p_quantidade,
        p_preco_unitario_praticado,
        p_valor_total,
        TRIM(p_observacao)
    );

END;
$$;