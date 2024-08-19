'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class TableCurrency extends Model {
        static associate() { }
    }

    TableCurrency.init(
        {
            tableID: DataTypes.BIGINT,
            currencyID: DataTypes.BIGINT,
            max: DataTypes.TEXT,
            min: DataTypes.TEXT,
            maxPay: DataTypes.TEXT,
            chips: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'TableCurrency',
        }
    )


    return TableCurrency
}