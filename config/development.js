require('dotenv').config()

module.exports = {
    username: process.env.LOCAL_DB_USERNAME,
    password: process.env.LOCAL_DB_PASSWORD,
    database: process.env.LOCAL_DB_DATABASE,
    host: process.env.LOCAL_DB_HOST,
    dialect: process.env.LOCAL_DB_DIALECT,
    port: process.env.LOCAL_DB_PORT,
    logging: false
}