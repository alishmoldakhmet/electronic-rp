require('dotenv').config()

module.exports = {
    username: process.env.PRODUCTION_DB_USERNAME,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_DATABASE,
    host: process.env.PRODUCTION_DB_HOST,
    dialect: process.env.PRODUCTION_DB_DIALECT,
    port: process.env.PRODUCTION_DB_PORT,
    logging: false
}