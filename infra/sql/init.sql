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
    status VARCHAR (15) NOT NULL,
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


INSERT INTO Usuarios
(nome, email, senha)
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

INSERT INTO usuario (nome, email, senha, role)
VALUES ('Admin', 'admin@email.com', '1234', 'admin');

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