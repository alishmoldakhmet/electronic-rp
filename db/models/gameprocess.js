'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class GameProcess extends Model {
        static associate() { }
    }

    GameProcess.init(
        {
            gameID: DataTypes.BIGINT,
            type: DataTypes.TEXT,
            total: DataTypes.TEXT,
            win: DataTypes.TEXT,
            reason: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'GameProcess',
            tableName: 'REPGameProcesses'
        }
    )


    return GameProcess
}