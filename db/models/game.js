'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class Game extends Model {
        static associate() { }
    }

    Game.init(
        {
            tableID: DataTypes.BIGINT,
            table: DataTypes.TEXT,
            operatorID: DataTypes.BIGINT,
            roundId: DataTypes.TEXT,
            number: DataTypes.TEXT,
            player: DataTypes.TEXT,
            currency: DataTypes.TEXT,
            startBalance: DataTypes.TEXT,
            endBalance: DataTypes.TEXT,
            refund: DataTypes.BIGINT,
            paid: DataTypes.BIGINT,
            endReason: DataTypes.TEXT,
            status: DataTypes.TINYINT,
            isPaused: DataTypes.TINYINT,
            isUpdated: DataTypes.TINYINT,
        },
        {
            sequelize,
            modelName: 'Game',
            tableName: 'REPGames'
        }
    )

    return Game
}