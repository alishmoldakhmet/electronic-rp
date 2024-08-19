'use strict'

const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {


    class Player extends Model {
        static associate() { }
    }


    Player.init(
        {
            uniqueId: DataTypes.TEXT,
            sid: DataTypes.TEXT,
            playerId: DataTypes.TEXT,
            firstName: DataTypes.TEXT,
            uuid: DataTypes.TEXT,
            ruuid: DataTypes.TEXT,
            currency: DataTypes.TEXT,
            locale: DataTypes.TEXT,
            tableID: DataTypes.BIGINT,
            table: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'Player',
        }
    )
    

    return Player
}