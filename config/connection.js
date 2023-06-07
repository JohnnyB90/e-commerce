require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = process.env.JAWSDB_URL
  ? new Sequelize(process.env.JAWSDB_URL)
  : new Sequelize(
    'ecommerce_db', // DB_NAME
    'root', // DB_USER
    'root', // DB_PASSWORD
    {
      host: 'localhost',
      dialect: 'mysql',
      port: 3306
    });
console.log(process.env.DB_NAME);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env);

module.exports = sequelize;
