-- to create a new database
CREATE DATABASE panteones;

-- to use database
use panteones;

-- creating a new table
CREATE TABLE customer (
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  seccion VARCHAR(100) NOT NULL,
  fecha VARCHAR(15)
);

-- to show all tables
show tables;

-- to describe table
describe customer;