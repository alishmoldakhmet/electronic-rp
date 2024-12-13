'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {

    class ExchangeCurrency extends Model {
        static associate() { }
    }

    ExchangeCurrency.init(
        {
            base: DataTypes.STRING,
            currency: DataTypes.STRING,
            multiplier: DataTypes.FLOAT
        },
        {
            sequelize,
            modelName: 'ExchangeCurrency',
        }
    )

    return ExchangeCurrency
}