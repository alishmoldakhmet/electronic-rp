require('dotenv').config()

/* Services */
const GameService = require("../services/GameService")

/* UUID */
const { v4: uuidv4 } = require('uuid')

/* Models */
const { sequelize, Sequelize, Game, Table, OperatorBonus, ExchangeCurrency } = require("../db/models")

/* Table */
const { TABLE, UID, SERVER, POSTFIX } = require("../config/table")

/* Socket IO Client */
const { io: cIO } = require("socket.io-client")

/* Game */
const Player = require("../game/Player")
const Dealer = require("../game/Dealer")
const Additional = require("../game/Additional")
const Winner = require("../game/Winner")

/* Fields */
const CHOICE = "CHOICE"
const DEALING = "DEALING"
const GAME = "GAME"

const RECONNECT_TIME = 3000



/* PLAY */
class Play extends GameService {

    socket = null
    centralIO = cIO(SERVER, { transports: ['websocket'], auth: { token: `${UID}`, type: `game` } })

    status = CHOICE

    /* Fields */
    players = {}

    cards = []

    constructor(io) {
        super()

        this.socket = io

        /* Central Jackpot Listener */
        this.centralIO.on("cJackpot", data => {
            io.sockets.emit("jackpot", data)
        })

        /* Load Cards */
        this.getCards()


        io.on('connection', socket => {

            /* ON CONNECT | PLAYER */
            if (socket.player && socket.player.token && socket.player.isPlayer) {

                const player = { socketId: socket.id, player: socket.player }
                const playerId = this.getPlayerId(socket.player)

                const gamePlayer = this.players[playerId]

                if (gamePlayer) {

                    if (socket.player.uniqueId !== this.players[playerId].uniqueId) {
                        this.socket.in(this.players[playerId].socketId).emit("newDeviceConnection", "ok")
                    }

                    this.players[playerId].socketId = socket.id
                    this.players[playerId].player = socket.player
                    this.players[playerId].uniqueId = socket.player.uniqueId
                    this.players[playerId].timestamp = Date.now()

                    this.reconnection(playerId, 'constructor')

                }
                else {
                    const playerData = {
                        ...player,
                        status: CHOICE,
                        gameData: null,
                        ante: 0,
                        bonus: 0,
                        total: 0,
                        playerCards: [],
                        dealerCards: [],
                        tempDealerCards: [],
                        exchangeCards: [],
                        bet: false,
                        pass: false,
                        exchange: false,
                        sixth: false,
                        used: false,

                        insurance: 0,
                        insuranceStatus: null,

                        isPurchase: false,
                        purchase: false,
                        removedCard: null,

                        game: null,
                        sixthGame: [],

                        dealerGame: null,

                        bonusResult: null,
                        result: null,

                        transactions: [],
                        balance: socket.player.isDemo ? parseInt(socket.player.maxPay) / 4 : 0,

                        bonusUID: null,

                        isDemo: socket.player.isDemo,
                        timestamp: Date.now()
                    }

                    this.players[playerId] = playerData

                    this.checkPlayersAbsense()

                }

                /* Update balance */
                this.updateBalance(playerId, socket.player)

                /* Update Jackpot */
                this.updateJackpot(playerId)
            }

            /* ON DISCONNECT | ALL */
            socket.on("disconnect", () => {
                this.disconnect(socket)
            })


            /*
                PLAYER EVENTS
                All player actions
            */

            /* START EVENT | PLAYER */
            socket.on("start", async (data) => {

                const playerId = this.getPlayerId(socket.player)

                const { ante, bonus } = data

                if (this.players[playerId] && !this.players[playerId].ante) {

                    this.players[playerId].socketId = socket.id

                    let gameProcesses = []

                    let statusText = "ANTE"
                    let total = parseFloat(ante)

                    if (bonus) {
                        statusText = "ANTE & BONUS"
                        total = parseFloat(ante) + parseFloat(bonus)
                    }

                    /* CREATE GAME */

                    const operatorID = socket.player.operator.id

                    const number = (new Date()).getMilliseconds() + Math.floor(Math.random() * 100000)

                    const balance = await this.updateBalance(playerId, socket.player)

                    const table = await Table.findOne({ where: { slug: TABLE, uid: UID } })

                    const gameData = {
                        tableID: table ? table.id : null,
                        table: table ? table.slug : TABLE,
                        operatorID,
                        roundId: `${POSTFIX}-${uuidv4()}`,
                        number,
                        player: playerId,
                        currency: socket.player.currency,
                        startBalance: balance,
                        endBalance: 0,
                        refund: 0,
                        endReason: null,
                        status: 0,
                        isPaused: 0,
                        dealt: 0,
                        isUpdated: 0
                    }

                    let created = { id: uuidv4(), number, roundId: gameData.roundId, isDemo: true }

                    if (this.players[playerId] && !this.players[playerId].isDemo) {
                        created = await Game.create(gameData)
                    }

                    this.players[playerId].gameData = { id: created.id, number: created.number, roundId: created.roundId, isDemo: created.isDemo }

                    const status = await this.debit(playerId, socket.player, total, statusText, created)

                    if (status) {

                        this.players[playerId].ante = ante
                        this.players[playerId].bonus = bonus
                        this.players[playerId].total = parseFloat(ante) + parseFloat(bonus)

                        this.players[playerId].status = DEALING
                        this.generate(playerId, 10)

                        this.socket.in(this.players[playerId].socketId).emit("gameInfo", created)

                        gameProcesses.push({ gameID: created.id, player: playerId, type: 'ante', reason: 'ANTE', total: parseFloat(ante) })

                        if (!this.players[playerId].isDemo) {

                            if (bonus) {

                                /* JACKPOT BONUS */
                                const bonusUID = `rep-${uuidv4()}`
                                this.players[playerId].bonusUID = bonusUID

                                const jackpotBonus = {
                                    operatorID: operatorID,
                                    tableID: table ? table.id : null,
                                    table: table ? table.slug : TABLE,
                                    player: playerId,
                                    number,
                                    bids: [{ uid: bonusUID, total: parseFloat(bonus) }],
                                    currency: socket.player.currency
                                }

                                this.centralIO.emit("jackpotBonus", jackpotBonus)

                                gameProcesses.push({ gameID: created.id, type: 'bonus', reason: 'BONUS', total: parseFloat(bonus) })
                            }

                            this.createGameProcesses(gameProcesses)

                        }

                    }
                    else {
                        this.reconnection(playerId, 'transaction')
                    }

                } else {
                    this.reconnection(playerId, 'error')
                }
            })

            /* SIXTH EVENT | PLAYER */
            socket.on("sixth", async () => {

                const id = this.getPlayerId(socket.player)

                const player = this.players[id]
                if (player) {
                    const status = await this.debit(id, player.player, player.ante, "6-CARD")
                    if (status) {
                        this.players[id].sixth = true
                        this.players[id].used = true
                        this.players[id].total = parseFloat(this.players[id].total) + parseFloat(player.ante)

                        this.createGameProcess(this.players[id].gameData, id, "sixth", "6-CARD", player.ante)

                        const numbers = this.numbers(id, 1)

                        numbers.forEach(number => {

                            const index = this.cards.findIndex(c => parseInt(c.id) === parseInt(number))

                            if (index > -1) {

                                const card = { ...this.cards[index], isSixth: true, uuid: uuidv4() }

                                this.players[id].playerCards.push(card)
                                this.players[id].used = true

                                let sixthCardArray = []
                                sixthCardArray.push(card)
                                this.createGameCards(this.players[id].gameData, sixthCardArray, "player", "sixth")

                                this.sendCard(id, "player", card)
                                const additional = new Additional(this.players[id].playerCards)
                                const hand = additional.get()

                                this.players[id].sixthGame = hand

                                this.players[id].status = GAME

                                //setTimeout(() => {
                                this.socket.in(this.players[id].socketId).emit("sixthGame", hand)
                                //}, RECONNECT_TIME)

                            }
                        })
                    } else {
                        this.reconnection(id, 'transaction')
                    }
                }

            })

            /* EXCHANGE EVENT | PLAYER */
            socket.on("exchange", async (exchanged) => {

                const id = this.getPlayerId(socket.player)

                const player = this.players[id]
                if (player) {
                    const status = await this.debit(id, player.player, player.ante, "EXCHANGE")
                    if (status) {

                        this.createGameProcess(this.players[id].gameData, id, "exchange", "EXCHANGE", player.ante)

                        const playerCards = this.players[id].playerCards

                        this.players[id].exchange = true
                        this.players[id].exchangeCards = exchanged
                        this.players[id].used = true
                        this.players[id].playerGame = null
                        this.players[id].status = GAME
                        this.players[id].total = parseFloat(this.players[id].total) + parseFloat(player.ante)

                        this.updateGameCards(this.players[id].gameData, exchanged, "hidden")

                        const numbers = this.numbers(id, exchanged.length)

                        let remaining = playerCards.filter(c => exchanged.findIndex(e => parseInt(e) === parseInt(c.id)) === -1)

                        let tempCards = []
                        numbers.forEach((number, i) => {
                            const index = this.cards.findIndex(c => parseInt(c.id) === parseInt(number))
                            if (index > -1) {
                                setTimeout(() => {

                                    const card = { ...this.cards[index], isExchange: true, uuid: uuidv4() }

                                    this.players[id].playerCards.push(card)
                                    tempCards.push(this.cards[index])

                                    this.sendCard(id, "player", card)

                                    if (exchanged.length === i + 1) {

                                        this.createGameCards(this.players[id].gameData, tempCards, "player", "exchange")

                                        const data = [...remaining, ...tempCards]
                                        const player = new Player(data)
                                        const hand = player.hand()

                                        this.players[id].playerGame = hand
                                        this.socket.in(this.players[id].socketId).emit("playerGame", hand)

                                    }
                                }, (i + 1) * 400)
                            }
                        })
                    } else {
                        this.reconnection(id, "transaction")
                    }
                }

            })

            /* INSURANCE EVENT | PLAYER */
            socket.on("insurance", async (value) => {
                const id = this.getPlayerId(socket.player)
                const player = this.players[id]
                if (player) {

                    const status = await this.debit(id, player.player, value, "INSURANCE")

                    if (status) {
                        this.createGameProcess(this.players[id].gameData, id, "insurance", "INSURANCE", value)
                        this.players[id].insurance = value
                        player.total = parseFloat(player.total) + parseFloat(value)
                    }
                    else {
                        this.reconnection(id, 'transaction')
                    }

                }
            })

            /* BET EVENT | PLAYER */
            socket.on("bet", async () => {

                const id = this.getPlayerId(socket.player)
                const socketPlayer = socket.player
                const player = this.players[id]
                const dealerCards = player.dealerCards
                const playerGame = player.playerGame
                const sixthGame = player.sixthGame

                if (player) {
                    const status = await this.debit(id, player.player, player.ante * 2, "BET")
                    if (status) {

                        this.createGameProcess(this.players[id].gameData, id, "bet", "BET", player.ante * 2)

                        this.players[id].bet = player.ante * 2
                        this.players[id].used = true
                        this.players[id].status = DEALING
                        this.players[id].total = parseFloat(this.players[id].total) + parseFloat(player.ante) * 2

                        const hand = this.getDealerGame(id)

                        this.players[id].dealerGame = hand

                        const game = sixthGame.length > 0 ? sixthGame[0] : playerGame

                        if (game.level >= 4 && hand.level === 0) {

                            this.players[id].isPurchase = true

                            let cards = hand.data
                            const removedCard = cards[0]
                            this.players[id].removedCard = removedCard

                            const data = {
                                removedCard,
                                dealerCards,
                                dealerGame: hand
                            }

                            setTimeout(() => {
                                this.socket.in(this.players[id].socketId).emit("purchase", data)
                            }, RECONNECT_TIME)

                        }
                        else {
                            this.play(id, socketPlayer, hand)
                        }

                    } else {
                        this.reconnection(id, "transaction")
                    }
                }

            })

            /* PASS EVENT | PLAYER */
            socket.on("pass", async () => {

                const id = this.getPlayerId(socket.player)
                const player = this.players[id]
                const dealerCards = player.dealerCards

                player.pass = true
                player.status = DEALING

                this.createGameProcess(player.gameData, id, "pass", "FOLD", 0)

                const result = { result: "lose", reason: "fold", sum: 0 }

                const hand = this.getDealerGame(id)
                player.dealerGame = hand

                const data = {
                    dealerCards,
                    dealerGame: hand,
                    result
                }


                const playerGame = player.playerGame
                const sixthGame = player.sixthGame

                const game = sixthGame.length > 0 ? sixthGame[0] : playerGame
                const second = sixthGame.length > 1 ? sixthGame[1] : null

                let gameName = game.name
                let gameMultiplier = game.multiplier
                if (second) {
                    gameName = gameName + " + " + second.name
                    gameMultiplier += second.multiplier
                }

                this.createGameResult(player.gameData, gameName, gameMultiplier, "player")
                this.createGameResult(player.gameData, hand.name, hand.multiplier, "dealer")

                player.result = result

                setTimeout(() => {
                    this.socket.in(player.socketId).emit("dealerData", data)
                }, RECONNECT_TIME)

                this.endGame(id, socket.player)

            })


            /* PURCHASE EVENT | PLAYER */
            socket.on("purchase", async (data) => {

                /* Fields */
                const id = this.getPlayerId(socket.player)
                const socketPlayer = socket.player
                const player = this.players[id]

                /* Check Player */
                if (player) {

                    /* Has a purchase */
                    if (data === "yes") {

                        /* DEBIT */
                        const status = await this.debit(id, player.player, player.ante, "PURCHASE OF A GAME FOR A DEALER")

                        if (status) {

                            this.createGameProcess(this.players[id].gameData, id, "purchase", "PURCHASE OF A GAME FOR A DEALER", player.ante)

                            this.players[id].purchase = true
                            this.players[id].total = parseFloat(this.players[id].total) + parseFloat(player.ante)

                            const numbers = this.numbers(id, 1)

                            numbers.forEach(number => {

                                const index = this.cards.findIndex(c => parseInt(c.id) === parseInt(number))

                                if (index > -1) {

                                    const card = { ...this.cards[index], isPurchase: true, uuid: uuidv4() }
                                    const hand = this.getDealerGame(id)
                                    let purchaseCardArray = [{ id: card.id, image: card.image }]

                                    this.createGameCards(this.players[id].gameData, purchaseCardArray, "dealer", "purchase")

                                    this.players[id].dealerCards.push(card)

                                    let dealerCards = hand.data
                                    let removedCardArray = [dealerCards[0].id]
                                    this.updateGameCards(this.players[id].gameData, removedCardArray, "removed")
                                    dealerCards.shift()

                                    const dealer = new Dealer([...dealerCards, card])
                                    const game = dealer.hand()

                                    this.play(id, socketPlayer, game, true)
                                }

                            })
                        }
                        else {
                            this.reconnection(id, 'transaction')
                        }
                    }

                    /* Does not have a purchase */
                    else {

                        const playerGame = player.playerGame
                        const sixthGame = player.sixthGame
                        const dealerGame = player.dealerGame

                        const game = sixthGame.length > 0 ? sixthGame[0] : playerGame
                        const second = sixthGame.length > 1 ? sixthGame[1] : null

                        let gameName = game.name
                        let gameMultiplier = parseInt(game.multiplier)

                        if (second) {
                            gameName = gameName + " + " + second.name
                            gameMultiplier = gameMultiplier + parseInt(second.multiplier)
                        }

                        const result = { result: "win", reason: "nogame", sum: parseInt(player.ante) * 4, anteMultiplier: 1, betMultiplier: 0 }

                        this.credit(id, player.player, parseInt(player.ante) * 4, 'DRAW')

                        this.updateGameProcess(this.players[id].gameData, "ante", player.ante * 2)
                        this.updateGameProcess(this.players[id].gameData, "bet", player.ante * 2)
                        this.createGameResult(player.gameData, dealerGame.name, dealerGame.multiplier, "dealer")
                        this.createGameResult(player.gameData, gameName, gameMultiplier, "player")

                        this.players[id].result = result
                        this.socket.in(this.players[id].socketId).emit("result", result)
                        this.endGame(id, socketPlayer)
                    }

                }

            })


            /* GAME SCREEN ACTION EVENT | PLAYER */
            socket.on("gameAction", async action => {

                /* FIELDS */
                const id = this.getPlayerId(socket.player)
                const player = this.players[id]

                if (player) {
                    this.setGameAction(player.player, action)
                }

            })


            /*
                ADMIN EVENTS
                The administrator will be able to continue or end the game, complete and notify about it.
            */


            /* END GAME EVENT | ADMIN */
            socket.on("end", ({ playerID }) => {

                /* CHECK FIELDS */
                if (playerID) {

                    /* GET A PLAYER */
                    const player = this.players[playerID]

                    /* CHECK THE PLAYER */
                    if (player) {

                        /* ASSIGNING END VALUES */
                        player.status = CHOICE

                        /* CLEAR THE PLAYER DATA */
                        this.clearPlayerData(playerID, player.player)

                        /* SENT TO CLIENT */
                        this.socket.in(player.socketId).emit("forceEnd")

                        /* Update Balance */
                        this.updateBalance(playerID, player.player)
                    }
                }
            })

            /* NOTIFICATION EVENT | ADMIN */
            socket.on("adminNotification", data => {

                /* CHECK FIELDS */
                if (data.playerID) {

                    /* GET A PLAYER */
                    const player = this.players[data.playerID]

                    /* CHECK THE PLAYER */
                    if (player) {

                        /* CREATE TIMER */
                        const timer = setTimeout(() => {

                            /* Update Balance */
                            this.updateBalance(data.playerID, player.player)

                            /* SENT TO CLIENT */
                            this.socket.in(player.socketId).emit("adminNotification", data)

                            /* CLEAR TIMEOUT */
                            clearTimeout(timer)

                        }, RECONNECT_TIME)

                    }
                }
            })


        })

    }


    /* GET PLAYER ID */
    getPlayerId = (data) => {
        let id = data.playerId
        if (data.isDemo) {
            id = "DEMO" + id
        }
        return id
    }


    /* Check players absense */
    checkPlayersAbsense = () => {

        setTimeout(() => {

            const length = Object.keys(this.players).length

            if (length > 50) {
                const array = Object.entries(this.players).map(([key, value]) => ({
                    id: key,
                    timestamp: value.timestamp
                }))

                const currentTimestamp = Date.now()

                array.forEach(item => {

                    if (!item.timestamp || currentTimestamp - parseInt(item.timestamp) > 3600000) {

                        if (this.players[item.id].gameData) {
                            this.endDbGame(this.players[item.id].gameData, "timestamp")
                        }

                        delete this.players[item.id]
                    }
                })
            }
        }, 1000)

    }

    /* GET CARDS  FROM DB */
    getCards = async () => {
        const sql = `SELECT * FROM Cards`
        const dbCards = await sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT, raw: true })
        this.cards = dbCards
    }

    /* RECONNECTION */
    reconnection = (id, reason) => {

        const player = this.players[id]

        let data = {
            status: player.status,
            gameInfo: player.gameData,
            ante: player.ante,
            bonus: player.bonus,
            total: player.total,
            playerCards: this.players[id].playerCards,
            dealerCards: player.dealerGame ? this.players[id].dealerCards : this.players[id].tempDealerCards,
            exchangeCards: player.exchangeCards,
            bet: player.bet,
            pass: player.pass,
            isExchange: player.exchange,
            sixth: player.sixth,
            used: player.used,
            insurance: player.insurance,
            insuranceStatus: player.insuranceStatus,
            isPurchase: player.isPurchase,
            purchase: player.purchase,
            removedCard: player.removedCard,
            playerGame: player.playerGame,
            sixthGame: player.sixthGame,
            dealerGame: player.dealerGame,

            bonusResult: player.bonusResult,
            result: player.result,

            transactions: player.transactions,

            transactionError: false,
        }

        if (reason === 'error') {
            data.error = true
        }
        if (reason === 'transaction') {
            data.transactionError = true
        }

        this.socket.in(this.players[id].socketId).emit('reconnection', data)
    }

    /* CLEAR PLAYER DATA */
    clearPlayerData = (id, socketPlayer) => {

        const socketId = this.players[id].socketId
        const balance = this.players[id].balance
        const isDemo = this.players[id].isDemo
        const timestamp = this.players[id].timestamp

        if (isDemo !== socketPlayer.isDemo) {
            return
        }

        this.players[id] = {
            socketId,
            player: socketPlayer,
            status: CHOICE,
            gameData: null,
            ante: 0,
            bonus: 0,
            total: 0,
            playerCards: [],
            dealerCards: [],
            tempDealerCards: [],
            exchangeCards: [],
            bet: false,
            pass: false,
            exchange: false,
            sixth: false,
            used: false,
            hasInsurance: false,
            insurance: 0,
            insuranceStatus: null,

            isPurchase: false,
            purchase: false,
            removedCard: null,

            game: null,
            sixthGame: [],

            dealerGame: null,

            bonusResult: null,
            result: null,

            transactions: [],

            bonusUID: null,
            balance,
            isDemo,
            timestamp
        }


    }

    /* GET DEALER GAME */
    getDealerGame = (id) => {

        const player = this.players[id]
        const dealer = new Dealer(player.dealerCards)
        const game = dealer.hand()

        if (player.insurance && !player.insuranceStatus) {

            let status = "lose"

            if (game.level === 0) {
                status = "win"
            }

            this.players[id].insuranceStatus = status

            setTimeout(() => {

                if (status === "win") {
                    const total = parseFloat(player.insurance) * 2
                    this.credit(id, player.player, total, 'INSURANCE WIN')
                    this.updateGameProcess(this.players[id].gameData, "insurance", total)
                }

                this.socket.in(this.players[id].socketId).emit("insuranceStatus", status)
            }, RECONNECT_TIME)

        }

        return game
    }

    /* Send dealer and player cards */
    sendCard = (id, type, card) => {
        this.socket.in(this.players[id].socketId).emit(type, card)
        setTimeout(() => {
            this.socket.in(this.players[id].socketId).emit(type, card)
        }, RECONNECT_TIME)

    }

    /* NUMBERS */
    numbers = (id, length = 10) => {

        if (this.players[id]) {

            let playerCards = this.players[id].playerCards
            let dealerCards = this.players[id].dealerCards

            let numbers = []

            let cLength = this.cards.length
            const min = this.cards[0] ? this.cards[0].id : 1
            const max = this.cards[cLength - 1] ? this.cards[cLength - 1].id : 52

            while (numbers.length < length) {

                let number = (parseInt(Math.random() * (max - min + 1))) + min
                const pi = playerCards.findIndex(e => parseInt(e.id) === number)
                const di = dealerCards.findIndex(e => parseInt(e.id) === number)

                if (numbers.indexOf(number) === -1 && di === -1 && pi === -1) {
                    numbers.push(number)
                }
            }

            return numbers

        }
        else {
            console.log('error with numbers func - user not exist')
        }
    }

    /* Generate */
    generate = async (id, length) => {

        const numbers = this.numbers(id, length)
        numbers.forEach((number, i) => {

            const index = this.cards.findIndex(c => parseInt(c.id) === parseInt(number))
            const playerData = this.players[id]

            const uuid = uuidv4()

            let card = { ...this.cards[index], uuid }
            let tempCard = { uuid, image: '' }

            setTimeout(async () => {

                if (i % 2 === 0) {

                    this.players[id].playerCards.push(card)

                    this.sendCard(id, "player", card)

                    const playerCards = this.players[id].playerCards

                    if (playerCards.length === 5) {

                        const player = new Player(playerCards)
                        const hand = player.hand()

                        let bonusResult = null

                        if (this.players[id].bonus) {
                            if (hand.bonus) {

                                const bonusUID = this.players[id].bonusUID
                                const operatorID = this.players[id].player.operator.id
                                const currency = this.players[id].player.currency

                                const operator = await OperatorBonus.findOne({ where: { operatorID } })
                                const jackpot = operator ? parseFloat(operator.jackpot) : 0

                                /* Get Exchange Dollar */
                                const exchangeDollar = await ExchangeCurrency.findOne({ where: { currency: "USD" } })
                                const dollarMultiplier = exchangeDollar ? exchangeDollar.multiplier : 1

                                const exchangeCurrency = await ExchangeCurrency.findOne({ where: { currency: currency } })
                                const exchangeMultiplier = exchangeCurrency ? exchangeCurrency.multiplier : 1

                                const playerBonus = parseFloat(this.players[id].bonus)
                                const maxPay = jackpot * exchangeMultiplier / dollarMultiplier
                                const win = playerBonus * parseFloat(hand.bonus)
                                const maxWin = win >= maxPay ? maxPay : win
                                const total = hand.code === "ROYALFLUSH" ? Number.isInteger(maxPay) ? maxPay : Number(maxPay).toFixed(1) : maxWin

                                bonusResult = { result: "win", bonusMultiplier: hand.bonus, total, combination: hand.name }

                                const jackpotWin = {
                                    uid: bonusUID,
                                    operatorID: operatorID,
                                    isJackpot: hand.code === "ROYALFLUSH",
                                    win: maxWin,
                                    multiplier: hand.bonus,
                                    combination: hand.name
                                }

                                this.centralIO.emit("jackpotWin", jackpotWin)

                                this.players[id].bonusResult = bonusResult
                                this.updateGameProcess(this.players[id].gameData, "bonus", total)

                                this.credit(id, playerData.player, total, 'BONUS WIN')

                            }
                            else {
                                bonusResult = { result: "lose", bonusMultiplier: 0, total: 0 }
                                this.players[id].bonusResult = bonusResult
                            }
                        }

                        this.players[id].playerGame = hand
                        this.players[id].status = GAME

                        this.createGameCards(this.players[id].gameData, playerCards, "player", "default")

                        if (bonusResult) {
                            this.socket.in(this.players[id].socketId).emit("bonusResult", bonusResult)
                        }

                        this.socket.in(this.players[id].socketId).emit("playerGame", hand)
                    }

                }
                else {

                    this.players[id].dealerCards.push(card)
                    let dealerTempCard = tempCard
                    if (i === 9) {
                        dealerTempCard = card
                    }

                    if (this.players[id].dealerCards.length === 5) {
                        this.createGameCards(this.players[id].gameData, this.players[id].dealerCards, "dealer", "default")
                    }

                    this.players[id].tempDealerCards.push(dealerTempCard)

                    this.sendCard(id, "dealer", dealerTempCard)
                }

            }, (i + 1) * 400)

        })
    }

    /* PLAY */
    play = (id, socketPlayer, dealerGame, withPurchase = false) => {

        const player = this.players[id]
        const dealerCards = player.dealerCards
        const playerGame = player.playerGame
        const sixthGame = player.sixthGame

        const game = sixthGame.length > 0 ? sixthGame[0] : playerGame
        const second = sixthGame.length > 1 ? sixthGame[1] : null


        let gameName = game.name
        let gameMultiplier = game.multiplier

        if (second) {
            gameName = gameName + " + " + second.name
            gameMultiplier += second.multiplier
        }

        this.createGameResult(player.gameData, gameName, gameMultiplier, "player")
        this.createGameResult(player.gameData, dealerGame.name, dealerGame.multiplier, "dealer")

        const winner = new Winner()
        let result = winner.play({ ante: player.ante, game, second, player: { maxPay: player.player.maxPay }, bonusResult: player.bonusResult, insuranceStatus: player.insuranceStatus, insurance: player.insurance }, dealerGame)

        if (withPurchase && dealerGame.level === 0) {
            result = { result: "win", reason: "purchase-no-game", sum: parseInt(player.ante) * 3, anteMultiplier: 0, betMultiplier: 0 }
        }

        if (result && (result.result === "win" || result.result === "draw")) {

            const text = result.result === "win" ? "WIN" : "DRAW"

            setTimeout(() => {
                this.credit(id, player.player, result.sum, text)
            }, RECONNECT_TIME)

            let anteValue = parseFloat(player.ante)
            let betValue = parseFloat(player.ante) * 2
            const maxPay = player.player.maxPay

            if (result.anteMultiplier && result.anteMultiplier > 0) {
                anteValue = anteValue + player.ante * result.anteMultiplier
            }

            if (result.betMultiplier && result.betMultiplier > 0) {
                const betWin = player.ante * result.betMultiplier * 2
                const totalWin = betWin > maxPay ? maxPay : betWin
                betValue = parseFloat(betValue) + parseFloat(totalWin)
            }

            this.updateGameProcess(this.players[id].gameData, "ante", anteValue)
            this.updateGameProcess(this.players[id].gameData, "bet", betValue)
        }

        this.players[id].result = result

        const data = { dealerCards, dealerGame, result }

        setTimeout(() => {
            this.socket.in(this.players[id].socketId).emit("dealerData", data)
        }, RECONNECT_TIME)

        this.endGame(id, socketPlayer)
    }

    endGame = (id, socketPlayer) => {

        this.endDbGame(this.players[id].gameData)

        setTimeout(() => {
            this.players[id].status = CHOICE
            this.clearPlayerData(id, socketPlayer)
        }, RECONNECT_TIME + 5000)

        setTimeout(() => {
            this.socket.in(this.players[id].socketId).emit("status", CHOICE)
        }, RECONNECT_TIME + 7000)
    }


    /* 
        UPDATE JACKPOT
        @ BONUS SYSTEM SERVICE 
    */
    updateJackpot = async id => {
        try {

            const player = this.players[id]

            if (player.isDemo) {
                return
            }

            const operator = await OperatorBonus.findOne({ where: { operatorID: player.player.operator.id } })

            if (operator && operator.enabled === 1) {
                this.socket.in(player.socketId).emit("jackpot", operator.jackpot)
            }
        }
        catch (error) {
            this.errorLog(`Error in Play.js - updateJackpot function: ${error.toString()}`)
        }
    }

    /* DISCONNECT */
    disconnect = socket => {

    }

    /* 
        GET BALANCE
        @ ALICORN SERVICE 
    */
    updateBalance = async (id, player) => {

        try {

            const playerData = this.players[id]

            let balance = playerData.balance

            if (!playerData.isDemo) {
                /* Send request to ALICORN SERVICE */
                balance = process.env.NODE_ENV && process.env.NODE_ENV === "development" ? 23700000 : await this.getBalance(player)
            }

            /* Send the BALANCE to socket client */
            if (balance) {

                if (!playerData.isDemo) {
                    this.players[id].balance = balance
                }

                this.socket.in(playerData.socketId).emit("balance", balance)
            }

            return balance
        }
        catch (error) {
            this.errorLog(`Error in Play.js - updateBalance function: ${error.toString()}`)
        }

    }


    /* 
        TRANSACTION CREDIT
        @ ALICORN SERVICE 
        PLUS
    */
    credit = async (id, player, amount, reason) => {

        try {

            const playerData = this.players[id]
            const game = playerData.gameData

            if (playerData.isDemo) {
                this.players[id].balance = this.players[id].balance + parseInt(amount)
                setTimeout(() => {
                    this.updateBalance(id, player)
                }, 1000)
                return true
            }

            /* Write the TRANSACTION in DB */
            const transaction = await this.createTransaction("credit", player, amount, reason, game)

            if (transaction) {

                /* Send the TRANSACTION to socket client */
                this.socket.in(this.players[id].socketId).emit("transaction", transaction)

                if (this.players[id]) {
                    this.players[id].transactions.push(transaction)
                }

                /* Send request to ALICORN SERVICE */
                const credit = await this.createCredit(player, amount, transaction.number, game.roundId)

                /* If the request is OK */
                if (credit && credit.status === 200 && credit.data && credit.data.status === "OK") {

                    /* Update balance */
                    await this.updateBalance(id, player)

                    /* Send the EDITED TRANSACTION to socket client */
                    this.socket.in(this.players[id].socketId).emit("editTransaction", { number: transaction.number, status: 1 })

                    /* UPDATE TRANSACTION in DB */
                    this.updateTransaction(transaction.number, credit.data ? JSON.stringify(credit.data) : "", 1)

                    if (this.players[id]) {
                        const ind = this.players[id].transactions.findIndex(e => e.number === transaction.number)
                        if (ind !== -1) {
                            this.players[id].transactions[ind].status = 1
                        }
                    }

                    return true
                }
                else {

                    /* Send the EDITED TRANSACTION to socket client */
                    this.socket.in(this.players[id].socketId).emit("editTransaction", { number: transaction.number, status: 2 })

                    /* UPDATE TRANSACTION in DB */
                    this.updateTransaction(transaction.number, credit.data ? JSON.stringify(credit.data) : "", 2)

                    if (this.players[id]) {
                        const ind = this.players[id].transactions.findIndex(e => e.number === transaction.number)
                        if (ind !== -1) {
                            this.players[id].transactions[ind].status = 2
                        }
                    }
                }
            }

        }
        catch (error) {
            this.errorLog(`Error in Play.js - credit function: ${error.toString()}`)
        }

        return false
    }


    /* 
        TRANSACTION DEBIT
        @ ALICORN SERVICE 
        MINUS
    */
    debit = async (id, player, amount, reason) => {

        try {

            const playerData = this.players[id]
            const game = playerData.gameData

            this.players[id].timestamp = Date.now()

            if (playerData.isDemo) {
                this.players[id].balance = this.players[id].balance - parseInt(amount)
                setTimeout(() => {
                    this.updateBalance(id, player)
                }, 1000)
                return true
            }

            /* Write the TRANSACTION in DB */
            const transaction = await this.createTransaction("debit", player, amount, reason, game)

            if (transaction) {

                /* Send the TRANSACTION to socket client */
                this.socket.in(this.players[id].socketId).emit("transaction", transaction)

                if (this.players[id]) {
                    this.players[id].transactions.push(transaction)
                }

                /* Send request to ALICORN SERVICE */
                const debit = await this.createDebit(player, amount, transaction.number, game.roundId)

                /* If the request is OK */
                if (debit && debit.status === 200 && debit.data && debit.data.status === "OK") {

                    /* Update balance */
                    await this.updateBalance(id, player)

                    /* Send the EDITED TRANSACTION to socket client */
                    this.socket.in(this.players[id].socketId).emit("editTransaction", { number: transaction.number, status: 1 })

                    /* UPDATE TRANSACTION in DB */
                    this.updateTransaction(transaction.number, debit.data ? JSON.stringify(debit.data) : "", 1)

                    if (this.players[id]) {
                        const ind = this.players[id].transactions.findIndex(e => e.number === transaction.number)
                        if (ind !== -1) {
                            this.players[id].transactions[ind].status = 1
                        }
                    }

                    return true
                }
                else {

                    /* Send the EDITED TRANSACTION to socket client */
                    this.socket.in(id).emit("editTransaction", { number: transaction.number, status: 2 })

                    /* UPDATE TRANSACTION in DB */
                    this.updateTransaction(transaction.number, debit.data ? JSON.stringify(debit.data) : "", 2)

                    if (this.players[id]) {
                        const ind = this.players[id].transactions.findIndex(e => e.number === transaction.number)
                        if (ind !== -1) {
                            this.players[id].transactions[ind].status = 2
                        }
                    }

                }

            }

        }
        catch (error) {
            this.errorLog(`Error in Play.js - debit function: ${error.toString()}`)
        }

        return process.env.NODE_ENV && process.env.NODE_ENV === "development" ? true : false
    }


}

module.exports = Play
