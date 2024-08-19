'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {

    class Log extends Model {
        static associate() { }
    }

    Log.init(
        {
            table: DataTypes.TEXT,
            type: DataTypes.STRING,
            message: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'Log',
        }
    )

    return Log
}