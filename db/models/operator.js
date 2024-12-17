'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {

    class Operator extends Model {
        static associate() { }
    }

    Operator.init(
        {
            token: DataTypes.TEXT,
            name: DataTypes.TEXT,
            slug: DataTypes.TEXT,
            startpoint: DataTypes.TEXT,
            balanceURL: DataTypes.TEXT,
            debitURL: DataTypes.TEXT,
            creditURL: DataTypes.TEXT,
            webhookURL: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'Operator',
        }
    )

    return Operator
}