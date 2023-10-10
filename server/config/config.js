const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        port: '3306',
        pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000,
        },
        dialect: 'mysql',
        logging: console.log,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        port: '3306',
        pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000,
        },
        dialect: 'mysql',
    },
};