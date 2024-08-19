
/* JSON WEB TOKEN */
const jwt = require("jsonwebtoken")

/* FS and PATH */
const fs = require("fs")
const path = require('path')

/* MD5 HASH Generator */
const md5 = require('md5')

/* Tokens */
const { AUTH_TOKEN } = require("../config/tokens")
const { TABLE } = require("../config/table")

/* Models */
const { Player, Table, Currency, TableCurrency } = require("../db/models")

/* Keys */
const PUBLIC_KEY = fs.readFileSync(path.resolve('config/player/player_public_key.pem'), 'utf8')




/* MIDDLEWARE BEARER */
const Bearer = async (socket, next) => {

    /* Fields */
    const { token } = socket.handshake.auth

    try {

        /* GET TABLE */
        const table = await Table.findOne({ where: { slug: TABLE } })


        if (table && token) {

            /* ADMIN */
            if (token === table.adminToken) {
                socket.data = { isAdmin: true }
                next()
                return
            }

            /* PLAYER */
            try {
                const decoded = jwt.verify(token, PUBLIC_KEY)


                if (decoded.token === md5(AUTH_TOKEN)) {

                    const player = await Player.findOne({ where: { playerId: decoded.playerId }, order: [["id", "DESC"]] })
                    const currency = await Currency.findOne({ where: { code: String(player.currency).toLocaleLowerCase() } })
                    const tc = await TableCurrency.findOne({ where: { tableID: table.id, currencyID: currency.id } })

                    const game = {
                        isPlayer: true,
                        token: token,
                        uniqueId: decoded.identifier,
                        firstName: player.firstName,
                        sid: player.sid,
                        playerId: player.playerId,
                        uuid: player.uuid,
                        ruuid: player.ruuid,
                        currency: player.currency,
                        locale: player.locale,
                        gameId: table.slug,
                        max: tc.max,
                        min: tc.min,
                        maxPay: tc.maxPay
                    }

                    socket.player = game
                    next()
                    return
                }

            }
            catch (error) {
                console.log(error)
            }


        }

    }
    catch (error) {
        console.log(error)
    }

    next(new Error("INTERNAL SERVER ERROR"))
    return
}


module.exports = Bearer