require('dotenv').config()

const TABLE = process.env.TABLE
const UID = process.env.UID
const SERVER = process.env.SERVER
const POSTFIX = process.env.POSTFIX

module.exports = { TABLE, UID, SERVER, POSTFIX }