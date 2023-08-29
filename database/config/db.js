import Sequelize from "sequelize";

const db = new Sequelize({
        username: 'dbmasteruser',
        password: '.S,M;)cwH&c7<<Q1(Gw77Rh|9,;z7H,Q',
        database: 'AMW',
        host: 'ls-6f3aacb9a7a69c164b20677b8e78e5d9208fa2e7.ciarb10nnkxe.us-west-2.rds.amazonaws.com',
        dialect: 'mysql',
      }
);

export default db;