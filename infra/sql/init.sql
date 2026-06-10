CREATE TABLE Produto (
    id_produto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_produto VARCHAR (80) NOT NULL,
    preco DECIMAL (10,2) NOT NULL,
    disponibilidade VARCHAR (12) NOT NULL
);

CREATE TABLE Cliente (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR (80) NOT NULL,
    endereco VARCHAR (100) NOT NULL,
    telefone VARCHAR (20) NOT NULL,
    status_cliente BOOLEAN,
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

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

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

INSERT INTO usuario (nome, email, senha, role)
VALUES ('Admin', 'admin@email.com', '1234', 'admin');

--SPRINT 11 - CRIANDO A VIEW  PEDIDOS COMPLETOS


--essa é a view criada 

CREATE VIEW vw_pedidos_completos AS
SELECT
    p.id_pedido,
    c.nome AS nome_cliente,
    c.telefone,
    pr.nome_produto,
    pr.preco AS valor_unitario,
    p.data_pedido,
    p.valor_total,
    p.status
FROM pedido p
INNER JOIN cliente c  ON p.id_cliente = c.id_cliente
INNER JOIN produto pr ON p.id_produto = pr.id_produto;



-- consultando a view (pois ele só funciona com SELECT)--
SELECT *
FROM vw_pedidos_completos;



--Mostrar apenas nome do produto e o valor total--
SELECT
    nome_produto,
    valor_total
FROM vw_pedidos_completos;



--Mostrar o os pedidos acima de 20.00 --
SELECT *
FROM vw_pedidos_completos
WHERE valor_total > 20.00;



--Ordenar pelo maior valor total em pedidos
SELECT *
FROM vw_pedidos_completos
ORDER BY valor_total DESC;



--Mostrar os pedidos entregue --
SELECT *
FROM vw_pedidos_completos
WHERE status = 'entregue';




--Uma view com pedidos completos baixos 
CREATE VIEW vw_pedidos_completos_baixo AS
SELECT
    pr.nome_produto,
    pr.preco,
    p.valor_total
FROM pedido p
INNER JOIN produto pr ON p.id_produto = pr.id_produto
WHERE pr.preco <= 10;


--Seleciona pedidos completos baixos

SELECT *
FROM vw_pedidos_completos_baixo;
