/* Sequelize */
const Sequelize = require("sequelize")

/* Models */
const { Log, Table, sequelize, Transaction, Game, GameCard, GameProcess, GameResult } = require("../db/models")

/* Fields */
const { TABLE } = require("../config/table")

/* UUID */
const { v4: uuidv4 } = require('uuid')

/* REST API */
const { sendDebit, sendCredit, balance } = require("../api/PlayerApi")


/* Game Services */
class GameService {

    playerAuthentication = async socket => {

    }

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


    /* CREATE TRANSACTION | DB */
    createTransaction = async (type, player, amount, reason, game) => {

        try {

            console.log(type, player, amount, reason, game)

            /* Check data */
            if (player && amount && reason && game) {

                /* TRANSACTION fields */
                const uuid = uuidv4()
                const transactionData = {
                    type,
                    number: uuid,
                    gameID: game.id,
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

                /* BALANCE REST API FIELDS */
                const uuid = uuidv4()
                const data = {
                    sid: player.sid,
                    uuid: uuid,
                    publicId: player.playerId,
                    currency: player.currency,
                    gameId: player.gameId,
                }

                const response = await balance(data)

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
    createDebit = async (player, amount, number) => {

        try {

            /* Check data */
            if (player && amount && number) {

                /* DEBIT REST API FIELDS */
                const refID = uuidv4()
                const debitData = {
                    sid: player.sid,
                    uuid: number,
                    publicId: player.playerId,
                    currency: player.currency,
                    gameId: player.gameId,
                    refId: refID,
                    amount: amount
                }

                /* Send request to ALICORN SERVICE */
                const debit = await sendDebit(debitData)

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
    createCredit = async (player, amount, number) => {

        try {

            /* Check data */
            if (player && amount && number) {

                /* CREDIT REST API FIELDS */
                const refID = uuidv4()
                const creditData = {
                    sid: player.sid,
                    uuid: number,
                    publicId: player.playerId,
                    currency: player.currency,
                    gameId: player.gameId,
                    refId: refID,
                    amount: amount
                }

                /* Send request to ALICORN SERVICE */
                const credit = await sendCredit(creditData)

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
    createGameCards = (game, cards, type) => {
        
        let tempCards = []

        try {

            if (!game || !cards || !type) {
                this.errorLog(`Error in GameService.js - createGameCard function: Invalid Parameters.`)
                return
            }

            if (Array.isArray(cards) && cards.length > 0) {
                cards.forEach(card => {
                    tempCards.push({ gameID: game.id, cardID: card.id, image: card.image, type })
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
        // console.log(game, player, type, win)
        try {

            if (!game || !type || !win) {
                this.errorLog(`Error in GameService.js - updateGameProcess function: Invalid Parameters.`)
                return
            }

            GameProcess.update({ win: win }, { where: { gameID: game.id, type: type } })
        }
        catch (error) {
            console.logerror()
            this.errorLog(`Error in GameService.js - updateGameProcess function: ${error.toString()}`)
        }
    }

    /* END GAME */

    endDbGame = (game) => {
        // console.log(game, player, type, win)
        try {

            if (!game) {
                this.errorLog(`Error in GameService.js - endGame function: Invalid Parameters.`)
                return
            }

            Game.update({ status: 1 }, { where: { id: game.id } })
        }
        catch (error) {
            console.logerror()
            this.errorLog(`Error in GameService.js - endGame function: ${error.toString()}`)
        }
    }

    /* Continue */
    continueGame = game => {
        try {

            console.log("Updated Game")

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