'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class Currency extends Model {
        static associate() { }
    }

    Currency.init(
        {
            name: DataTypes.TEXT,
            code: DataTypes.STRING,
            symbol: DataTypes.STRING,
            isAfter: DataTypes.TINYINT
        },
        {
            sequelize,
            modelName: 'Currency',
        }
    )

    return Currency
}