CREATE TABLE perfil (
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

SELECT * FROM itens;

INSERT into categoria (id, nome) VALUES (1, "Animais"); 
INSERT into categoria (id, nome) VALUES (2, "Comida");
INSERT into categoria (id, nome) VALUES (3, "Cores");
INSERT into categoria (id, nome) VALUES (4, "Rotina");
INSERT into categoria (id, nome) VALUES (6, "Objetos");
INSERT into categoria (id, nome) VALUES (7, "Alfabeto");
INSERT into categoria (id, nome) VALUES (8, "Formas");
INSERT into categoria (id, nome) VALUES (9, "Emoções");