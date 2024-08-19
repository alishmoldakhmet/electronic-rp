'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class GameCard extends Model {
        static associate() { }
    }

    GameCard.init(
        {
            gameID: DataTypes.BIGINT,
            player: DataTypes.TEXT,
            cardID: DataTypes.BIGINT,
            image: DataTypes.TEXT,
            type: DataTypes.TEXT,
            status: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'GameCard',
            tableName: 'REPGameCards'
        }
    )

    return GameCard
}