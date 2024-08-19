'use strict'
const { Model } = require('sequelize')


module.exports = (sequelize, DataTypes) => {


    class Card extends Model {
        static associate() { }
    }


    Card.init(
        {
            name: DataTypes.TEXT,
            image: DataTypes.TEXT,
            value: DataTypes.TEXT,
            barcode: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'Card',
        }
    )

    return Card
}