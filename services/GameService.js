/* Models */
const { Log, Player, Transaction, Game, GameCard, GameProcess, GameResult } = require("../db/models")

/* Fields */
const { TABLE } = require("../config/table")

/* UUID */
const { v4: uuidv4 } = require('uuid')

/* REST API */
const { sendDebit, sendCredit, balance } = require("../api/PlayerApi")
const { gameAction } = require("../api/Integration")


/* Game Services */
class GameService {

    /* CREATE LOG SERVICE */
    errorLog = error => {
        Log.create({ table: TABLE, type: 'error', message: error })
    }

    /* FIND DEALER COMMAND */
    commandStatus = (commands, command) => {

        if (commands && Array.isArray(commands)) {

            const index = commands.findIndex(e => e === command)

            if (index > -1) {
                return false
            }

        }

        return true
    }



    /* SET GAME ACTION | REST API */
    setGameAction = async (player, action) => {
        try {


            /* Check data */
            if (player) {

                const playerData = await Player.findOne({ where: { playerId: player.playerId }, order: [["id", "DESC"]] })

                /* CHECK OPERATOR */
                if (!player.operator) {
                    this.errorLog(`Error in GameService.js - setGameAction function: Invalid OPERATOR`)
                    return null
                }

                /* CHECK OPERATOR LINKS */
                if (!player.operator.startpoint || !player.operator.webhookURL) {
                    this.errorLog(`Error in GameService.js - setGameAction function: Invalid OPERATOR LINKS`)
                    return null
                }

                /* ACTION REST API FIELDS */
                const uri = `${player.operator.startpoint}${player.operator.webhookURL}`
                const data = {
                    sid: playerData.sid,
                    publicId: player.playerId,
                    gameId: player.gameId,
                    action
                }

                if (uri) {

                    const response = await gameAction(uri, data)

                    if (response && response.status && response.status === 200 && response.data.status === "OK") {
                        return response.data.balance
                    }
                }
            }


            this.errorLog(`Error in GameService.js - setGameAction function: Invalid Data or REST API Error`)
            return null

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - setGameAction function: ${error.toString()}`)
            return null
        }
    }


    /* CREATE TRANSACTION | DB */
    createTransaction = async (type, player, amount, reason, game) => {

        try {

            /* Check data */
            if (player && amount && reason && game) {

                /* TRANSACTION fields */
                const uuid = uuidv4()
                const transactionData = {
                    type,
                    number: uuid,
                    gameID: game.id,
                    roundId: game.roundId,
                    player: player.playerId,
                    currency: player.currency,
                    reason,
                    total: amount,
                    status: 0,
                }

                /* Write the TRANSACTION in DB */
                const transaction = await Transaction.create(transactionData, { plain: true })

                return transaction
            }

            this.errorLog(`Error in GameService.js - createTransaction function: Invalid Data`)
            return null

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createTransaction function: ${error.toString()}`)
            return null
        }
    }


    /* UPDATE TRANSACTION | DB */
    updateTransaction = (number, result, status) => {

        try {

            /* Check data */
            if (number && status && result) {
                Transaction.update({ status, result }, { where: { number } })
                return { message: "Updated" }
            }

            this.errorLog(`Error in GameService.js - updateTransaction function: Invalid Data`)
            return null

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - updateTransaction function: ${error.toString()}`)
            return null
        }

    }


    /* GET BALANCE | REST API */
    getBalance = async (player) => {
        try {


            /* Check data */
            if (player) {

                const last = await Player.findOne({ where: { playerId: player.playerId }, order: [["id", "DESC"]] })

                /* CHECK OPERATOR */
                if (!player.operator) {
                    this.errorLog(`Error in GameService.js - getBalance function: Invalid OPERATOR`)
                    return null
                }

                /* CHECK OPERATOR LINKS */
                if (!player.operator.startpoint || !player.operator.balanceURL) {
                    this.errorLog(`Error in GameService.js - getBalance function: Invalid OPERATOR LINKS`)
                    return null
                }

                /* BALANCE REST API FIELDS */
                const uri = `${player.operator.startpoint}${player.operator.balanceURL}`
                const uuid = uuidv4()

                const data = {
                    sid: last.sid,
                    uuid: uuid,
                    publicId: player.playerId,
                    currency: player.currency,
                    gameId: player.gameId,
                }

                const response = await balance(uri, data)

                if (response && response.status && response.status === 200 && response.data.status === "OK") {
                    return response.data.balance
                }

            }


            this.errorLog(`Error in GameService.js - getBalance function: Invalid Data or REST API Error`)
            return null

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - getBalance function: ${error.toString()}`)
            return null
        }
    }


    /* CREATE DEBIT | REST API */
    createDebit = async (player, amount, number, roundId = null) => {

        try {

            /* Check data */
            if (player && amount && number) {

                const data = await Player.findOne({ where: { playerId: player.playerId }, order: [["id", "DESC"]] })

                /* CHECK OPERATOR */
                if (!player.operator) {
                    this.errorLog(`Error in GameService.js - createDebit function: Invalid OPERATOR`)
                    return null
                }

                /* CHECK OPERATOR LINKS */
                if (!player.operator.startpoint || !player.operator.debitURL) {
                    this.errorLog(`Error in GameService.js - createDebit function: Invalid OPERATOR LINKS`)
                    return null
                }

                /* DEBIT REST API FIELDS */
                const uri = `${player.operator.startpoint}${player.operator.debitURL}`
                const refID = uuidv4()

                const debitData = {
                    sid: data.sid,
                    uuid: number,
                    roundId,
                    publicId: player.playerId,
                    currency: player.currency,
                    gameId: player.gameId,
                    refId: refID,
                    amount: amount
                }

                /* Send request to ALICORN SERVICE */
                const debit = await sendDebit(uri, debitData)

                return debit
            }

            this.errorLog(`Error in GameService.js - createDebit function: Invalid Data`)
            return null

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createDebit function: ${error.toString()}`)
            return null
        }

    }



    /* CREATE CREDIT | REST API */
    createCredit = async (player, amount, number, roundId = null) => {

        try {

            /* Check data */
            if (player && amount && number) {

                const data = await Player.findOne({ where: { playerId: player.playerId }, order: [["id", "DESC"]] })

                /* CHECK OPERATOR */
                if (!player.operator) {
                    this.errorLog(`Error in GameService.js - createCredit function: Invalid OPERATOR`)
                    return null
                }

                /* CHECK OPERATOR LINKS */
                if (!player.operator.startpoint || !player.operator.creditURL) {
                    this.errorLog(`Error in GameService.js - createCredit function: Invalid OPERATOR LINKS`)
                    return null
                }

                /* CREDIT REST API FIELDS */
                const uri = `${player.operator.startpoint}${player.operator.creditURL}`
                const refID = uuidv4()

                const creditData = {
                    sid: data.sid,
                    uuid: number,
                    roundId,
                    publicId: player.playerId,
                    currency: player.currency,
                    gameId: player.gameId,
                    refId: refID,
                    amount: amount
                }

                /* Send request to ALICORN SERVICE */
                const credit = await sendCredit(uri, creditData)

                return credit
            }

            this.errorLog(`Error in GameService.js - createCredit function: Invalid Data`)
            return null

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createCredit function: ${error.toString()}`)
            return null
        }

    }

    /* CREATE GAME CARD | DB */
    createGameCards = (game, cards, type, status) => {

        if (game.isDemo) {
            return
        }

        let tempCards = []

        try {

            if (!game || !cards || !type || !status) {
                this.errorLog(`Error in GameService.js - createGameCard function: Invalid Parameters.`)
                return
            }

            if (Array.isArray(cards) && cards.length > 0) {
                cards.forEach(card => {
                    tempCards.push({ gameID: game.id, cardID: card.id, image: card.image, type, status })
                })
            }
            GameCard.bulkCreate(tempCards)
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createGameCard function: ${error.toString()}`)
        }

    }

    /* UPDATE GAME EXCHANGED CARDS */
    updateGameCards = (game, cards, status) => {

        if (game.isDemo) {
            return
        }

        try {

            if (!game || !cards) {
                this.errorLog(`Error in GameService.js - createGameCard function: Invalid Parameters.`)
                return
            }

            if (Array.isArray(cards) && cards.length > 0) {
                cards.forEach(card => {
                    GameCard.update({ status: status }, { where: { gameID: game.id, cardID: card } })
                })
            }
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createGameCard function: ${error.toString()}`)
        }
    }


    /* CLEAR GAME CARD | DB */
    clearGameCard = game => {

        if (game.isDemo) {
            return
        }

        try {

            if (!game) {
                this.errorLog(`Error in GameService.js - clearGameCard function: Invalid Parameters.`)
                return
            }

            GameCard.destroy({ where: { gameID: game.id } })
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - clearGameCard function: ${error.toString()}`)
        }

    }

    /* CREATE GAME RESULT | DB */
    createGameResult = (game, result, multiplier, type) => {

        if (game.isDemo) {
            return
        }

        try {

            if (!game || !result || !type) {
                this.errorLog(`Error in GameService.js - createGameResult function: Invalid Parameters.`)
                return
            }

            GameResult.create({ gameID: game.id, result: result, multiplier: multiplier, type: type })

        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createGameResult function: ${error.toString()}`)
        }
    }

    /* CREATE GAME PROCESSES | DB */
    createGameProcesses = processes => {
        try {
            GameProcess.bulkCreate(processes)
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createGameProcess function: ${error.toString()}`)
        }
    }

    /* CREATE GAME PROCESS | DB */
    createGameProcess = (game, player, type, reason, total) => {

        if (game.isDemo) {
            return
        }

        try {

            if (!game || !player || !type || !reason || total === undefined || total === null) {
                this.errorLog(`Error in GameService.js - createGameCard function: Invalid Parameters.`)
                return
            }

            GameProcess.create({ gameID: game.id, player, type, reason, total })
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - createGameCard function: ${error.toString()}`)
        }

    }

    /* UPDATE GAME PROCESS */
    updateGameProcess = (game, type, win) => {

        if (game.isDemo) {
            return
        }

        
        try {

            if (!game || !type || !win) {
                this.errorLog(`Error in GameService.js - updateGameProcess function: Invalid Parameters.`)
                return
            }

            GameProcess.update({ win: win }, { where: { gameID: game.id, type: type } })
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - updateGameProcess function: ${error.toString()}`)
        }
    }

    /* END GAME */

    endDbGame = (game) => {

        if (game.isDemo) {
            return
        }

        try {

            if (!game) {
                this.errorLog(`Error in GameService.js - endGame function: Invalid Parameters.`)
                return
            }

            Game.update({ status: 1 }, { where: { id: game.id } })
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - endGame function: ${error.toString()}`)
        }
    }

    /* Continue */
    continueGame = game => {

        if (game.isDemo) {
            return
        }

        try {

            if (!game) {
                this.errorLog(`Error in GameService.js - continueGame function: Invalid Parameters.`)
                return
            }

            Game.update({ isPaused: 0, isUpdated: 1 }, { where: { id: game.id } })
        }
        catch (error) {
            this.errorLog(`Error in GameService.js - continueGame function: ${error.toString()}`)
        }
    }

}

module.exports = GameService