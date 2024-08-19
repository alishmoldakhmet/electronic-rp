'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class Table extends Model {
        static associate() { }
    }

    Table.init(
        {
            name: DataTypes.TEXT,
            slug: DataTypes.TEXT,
            uid: DataTypes.TEXT,
            game: DataTypes.TEXT,
            dealer: DataTypes.TEXT,
            gameURL: DataTypes.TEXT,
            backURL: DataTypes.TEXT,
            hlsURL: DataTypes.TEXT,
            dealerMonitorToken: DataTypes.TEXT,
            dealerSocketToken: DataTypes.TEXT,
            scannerToken: DataTypes.TEXT,
            adminToken: DataTypes.TEXT,
            atemToken: DataTypes.TEXT,
            visible: DataTypes.TINYINT,
            available: DataTypes.TINYINT
        },
        {
            sequelize,
            modelName: 'Table',
        }
    )

    return Table
}