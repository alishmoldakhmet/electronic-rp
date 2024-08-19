'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class GameResult extends Model {
        static associate() { }
    }

    GameResult.init(
        {
            gameID: DataTypes.BIGINT,
            result: DataTypes.TEXT,
            multiplier: DataTypes.TEXT,
            type: DataTypes.TEXT,
            status: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'GameResult',
            tableName: 'REPGameResults'
        }
    )

    return GameResult
}