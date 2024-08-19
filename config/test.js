require('dotenv').config()

module.exports = {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_DATABASE,
    host: process.env.TEST_DB_HOST,
    dialect: process.env.TEST_DB_DIALECT,
    port: process.env.TEST_DB_PORT,
    logging: false
}