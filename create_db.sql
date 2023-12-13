CREATE DATABASE OnePieceCardLibrary;
USE OnePieceCardLibrary;
CREATE TABLE cards (id INT AUTO_INCREMENT,
CardName VARCHAR(50), 
CardType VARCHAR(10), 
CardColour VARCHAR(10), 
CardCost INT(11) unsigned,
CardRarity VARCHAR(20), 
CardPriceinMart DECIMAL(5,2) unsigned,
PRIMARY KEY(id));

INSERT INTO cards (CardName, CardType, CardColour, CardCost, CardRarity, CardPriceinMart)
VALUES('Borsalino', 'Character', 'Black', '4', 'SR', '20'),
      ('Sanji', 'Character', 'Yellow', '4', 'SR', '21.23');
CREATE USER 'robin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';

CREATE TABLE UserDetails (
      id INT AUTO_INCREMENT PRIMARY KEY, 
      username VARCHAR(50) NOT NULL, 
      hashedPassword longtext NOT NULL,
      firstname VARCHAR(50) NOT NULL, 
      lastname VARCHAR(50) NOT NULL, 
      email VARCHAR(50) NOT NULL
      );

GRANT ALL PRIVILEGES ON OnePieceCardLibrary.* TO 'robin'@'localhost';