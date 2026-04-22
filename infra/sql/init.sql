CREATE TABLE Cliente (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR (80) NOT NULL,
    endereco VARCHAR (100) NOT NULL,
    telefone VARCHAR (20) NOT NULL,
    cpf VARCHAR (11)
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

CREATE TABLE Produto (
    id_produto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_produto VARCHAR (80) NOT NULL,
    preco DECIMAL (10,2) NOT NULL,
    disponibilidade VARCHAR (12) NOT NULL
);
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);
UPDATE produto SET cod_produto = nextval('seq_cod_produto') WHERE cod_produto IS NULL;
UPDATE pedido SET cod_pedido = nextval('seq_cod_pedido') WHERE cod_pedido IS NULL;

CREATE SEQUENCE IF NOT EXISTS seq_cod_produto START 1;

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
BEFORE INSERT ON produto
FOR EACH ROW
EXECUTE FUNCTION gerar_cod_produto();

ALTER TABLE produto
ALTER COLUMN cod_produto SET NOT NULL;


CREATE SEQUENCE IF NOT EXISTS seq_cod_pedido START 1;

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
BEFORE INSERT ON pedido
FOR EACH ROW
EXECUTE FUNCTION gerar_cod_pedido();

ALTER TABLE pedido
ALTER COLUMN cod_pedido SET NOT NULL;


INSERT INTO Cliente (nome, endereco, telefone, cpf) 
VALUES
('Ana Souza', 'Rua das Flores, 120 - Centro', '13998123456', '12345678901'),
('Carlos Mendes', 'Av Brasil, 450 - Jardim América', '13997456789', '23456789012'),
('Juliana Lima', 'Rua São Pedro, 78 - Vila Nova', '13998877665', '34567890123'),
('Marcos Oliveira', 'Rua das Palmeiras, 300 - Centro', '13997766554', '45678901234'),
('Fernanda Rocha', 'Av Santos Dumont, 89 - Jardim Bela Vista', '13996655443', '56789012345'),
('Ricardo Alves', 'Rua XV de Novembro, 210 - Centro', '13995544332', '67890123456'),
('Patrícia Gomes', 'Rua do Comércio, 145 - Vila Rica', '13994433221', '78901234567'),
('Lucas Ferreira', 'Av Padre Anchieta, 560 - Centro', '13993322110', '89012345678'),
('Camila Santos', 'Rua Antônio Prado, 67 - Jardim Europa', '13992211009', '90123456789'),
('Bruno Costa', 'Rua das Acácias, 400 - Vila Atlântica', '13991100998', '01234567890');

INSERT INTO Produto (nome_produto, preco, disponibilidade)
VALUES
('X-Burguer', 18.90, 'disponível'),
('X-Salada', 20.90, 'disponível'),
('X-Bacon', 24.90, 'disponível'),
('Batata Frita Média', 15.00, 'disponível'),
('Batata Frita Grande', 22.00, 'indisponível'),
('Refrigerante Lata', 6.00, 'disponível'),
('Suco Natural', 8.50, 'disponível'),
('Milkshake Chocolate', 16.00, 'indisponível'),
('Hot Dog Especial', 17.50, 'disponível'),
('Combo Família', 79.90, 'disponível');

INSERT INTO Pedido (id_cliente, id_produto, data_pedido, valor_total, status)
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

INSERT INTO usuarios (nome, email, senha, role) 
VALUES 
('Maria Souza', 'maria@email.com', 'senha123', 'usuario'),
('Carlos Lima', 'carlos@email.com', 'abc123', 'usuario'),
('Ana Costa', 'ana@email.com', 'senha456', 'admin'),
( 'Jimin','jikook@email.com','junkook','usuario'),
( 'Yoongi','choki@email.com','agust-d','usuario'),
( 'J-Hope','hope@email.com','mange','usuario'),
( 'Jungkook','jungmin@email.com','jimin','usuario'),
('adimin','admin@email.com','admin','admin');
