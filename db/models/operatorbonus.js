'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {

    class OperatorBonus extends Model {
        static associate() { }
    }

    OperatorBonus.init(
        {
            operatorID: DataTypes.BIGINT,
            enabled: DataTypes.TINYINT,
            jackpot: DataTypes.TEXT,
            score: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'OperatorBonus',
        }
    )

    return OperatorBonus
}