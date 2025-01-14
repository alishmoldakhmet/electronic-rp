/* DOTENV */
require('dotenv').config()

/* Express */
const express = require('express')
const cors = require("cors")
const bodyParser = require('body-parser')

/* Server and Socket */
const http = require("http")
const { Server } = require("socket.io")

/* Middlewares */
const bearer = require("./middlewares/Bearer")

/* Game */
const Play = require("./connections/Play")

/* Fields */
const port = process.env.PORT || 8000
const origin = process.env.FRONT_URL || "*"

/* Create Server */
const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*", credentials: true } })

/* Set options */
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* Static files */
app.use(express.static("public", { maxAge: 3600000 }))

/* 404 path */
app.use((_, response) => {
    return response.status(404).send({ errorCode: 404, error: "page not found" })
})

/* Socket middleware */
io.use(bearer)

/* Socket connection */
new Play(io)

/* Start server */
server.listen(port, () => {
    console.log(`RUSSIAN ELECTRONIC POKER GAME listening on port ${port}`)
})
