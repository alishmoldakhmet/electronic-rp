'use strict'

const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class Transaction extends Model {
        static associate() {
        }
    }

    Transaction.init(
        {
            number: DataTypes.TEXT,
            gameID: DataTypes.TEXT,
            roundId: DataTypes.TEXT,
            player: DataTypes.TEXT,
            status: DataTypes.TINYINT,
            result: DataTypes.TEXT,
            reason: DataTypes.TEXT,
            type: DataTypes.TEXT,
            currency: DataTypes.TEXT,
            total: DataTypes.TEXT,
        },
        {
            sequelize,
            modelName: 'Transaction',
            tableName: 'REPTransactions'
        }
    )

    return Transaction
}