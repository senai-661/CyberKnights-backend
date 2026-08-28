CREATE TABLE Cliente (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(100) NOT NULL,
    endereco VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cpf VARCHAR(11)
);

CREATE TABLE Usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL
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
    id_cliente INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    data_pedido DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status_pedido VARCHAR(15) NOT NULL,
    cod_pedido INTEGER NOT NULL,

    FOREIGN KEY (id_cliente)
        REFERENCES Cliente(id_cliente),

    FOREIGN KEY (id_produto)
        REFERENCES Produto(id_produto)
);

CREATE SEQUENCE IF NOT EXISTS seq_cod_produto
START 1;

CREATE SEQUENCE IF NOT EXISTS seq_cod_pedido
START 1;


CREATE OR REPLACE FUNCTION gerar_cod_produto()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.cod_produto IS NULL THEN
        NEW.cod_produto := nextval('seq_cod_produto');
    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_cod_produto ON Produto;

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


DROP TRIGGER IF EXISTS trigger_cod_pedido ON Pedido;

CREATE TRIGGER trigger_cod_pedido
BEFORE INSERT ON Pedido
FOR EACH ROW
EXECUTE FUNCTION gerar_cod_pedido();


INSERT INTO Cliente
(nome, email, endereco, telefone, cpf)
VALUES
('Ana Souza', 'ana@email.com', 'Rua das Flores, 120 - Centro', '13998123456', '12345678901'),
('Carlos Mendes', 'carlos@email.com', 'Av Brasil, 450 - Jardim América', '13997456789', '23456789012'),
('Juliana Lima', 'juliana@email.com', 'Rua São Pedro, 78 - Vila Nova', '13998877665', '34567890123'),
('Marcos Oliveira', 'marcos@email.com', 'Rua das Palmeiras, 300 - Centro', '13997766554', '45678901234'),
('Fernanda Rocha', 'fernanda@email.com', 'Av Santos Dumont, 89 - Jardim Bela Vista', '13996655443', '56789012345'),
('Ricardo Alves', 'ricardo@email.com', 'Rua XV de Novembro, 210 - Centro', '13995544332', '67890123456'),
('Patrícia Gomes', 'patricia@email.com', 'Rua do Comércio, 145 - Vila Rica', '13994433221', '78901234567'),
('Lucas Ferreira', 'lucas@email.com', 'Av Padre Anchieta, 560 - Centro', '13993322110', '89012345678'),
('Camila Santos', 'camila@email.com', 'Rua Antônio Prado, 67 - Jardim Europa', '13992211009', '90123456789'),
('Bruno Costa', 'bruno@email.com', 'Rua das Acácias, 400 - Vila Atlântica', '13991100998', '01234567890');


INSERT INTO Usuarios
(nome, email, senha)
VALUES
('Sofia Silva', 'sofia@email.com', '123456'),
('João Santos', 'joao@email.com', 'abcdef'),
('Maria Oliveira', 'maria@email.com', 'senha123'),
('Carlos Souza', 'carlos@email.com', 'teste456');


INSERT INTO Produto
(nome_produto, preco, disponibilidade, cod_produto)
VALUES
('X-Burguer', 18.90, 'disponível', nextval('seq_cod_produto')),
('X-Salada', 20.90, 'disponível', nextval('seq_cod_produto')),
('X-Bacon', 24.90, 'disponível', nextval('seq_cod_produto')),
('Batata Frita Média', 15.00, 'disponível', nextval('seq_cod_produto')),
('Batata Frita Grande', 22.00, 'indisponível', nextval('seq_cod_produto')),
('Refrigerante Lata', 6.00, 'disponível', nextval('seq_cod_produto')),
('Suco Natural', 8.50, 'disponível', nextval('seq_cod_produto')),
('Milkshake Chocolate', 16.00, 'indisponível', nextval('seq_cod_produto')),
('Hot Dog Especial', 17.50, 'disponível', nextval('seq_cod_produto')),
('Combo Família', 79.90, 'disponível', nextval('seq_cod_produto'));


INSERT INTO Pedido
(id_cliente, id_produto, data_pedido, valor_total, status_pedido, cod_pedido)
VALUES
(1, 1, '2026-02-20', 18.90, 'entregue', nextval('seq_cod_pedido')),
(2, 3, '2026-02-21', 24.90, 'preparando', nextval('seq_cod_pedido')),
(3, 4, '2026-02-22', 15.00, 'entregue', nextval('seq_cod_pedido')),
(4, 10, '2026-02-23', 79.90, 'à caminho', nextval('seq_cod_pedido')),
(5, 2, '2026-02-23', 20.90, 'pedido aceito', nextval('seq_cod_pedido')),
(6, 6, '2026-02-24', 6.00, 'entregue', nextval('seq_cod_pedido')),
(7, 9, '2026-02-24', 17.50, 'preparando', nextval('seq_cod_pedido')),
(8, 7, '2026-02-25', 8.50, 'entregue', nextval('seq_cod_pedido')),
(9, 1, '2026-02-25', 18.90, 'à caminho', nextval('seq_cod_pedido')),
(10, 3, '2026-02-25', 24.90, 'pedido aceito', nextval('seq_cod_pedido'));