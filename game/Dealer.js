'use strict'

const Game = require("./Game")





class Dealer extends Game {


    hand = () => {

        if (this.list.length !== 5) {
            return []
        }

        if (this.isFlush() && this.isStraight() === "ROYALSTRAIGHT") {
            return {
                name: "ROYAL FLUSH",
                code: "ROYALFLUSH",
                level: 100,
                multiplier: 100,
                data: this.all(),
                strength: this.strength()
            }
        }
        else if (this.isFlush() && this.isStraight() === "STRAIGHT") {

            const straight = this.straight()

            return {
                name: "STRAIGHT FLUSH",
                code: "STRAIGHTFLUSH",
                level: 50,
                multiplier: 50,
                data: straight.data,
                strength: straight.strength
            }
        }
        else if (this.isFourOfAKind()) {

            const value = this.isFourOfAKind()

            return {
                name: "FOUR OF A KIND",
                code: "FOUROFAKIND",
                level: 20,
                multiplier: 20,
                data: this.single(value),
                value,
                strength: this.strength()
            }
        }
        else if (this.isThreeOfAKind() && this.pairs().length === 1) {

            const value = this.isThreeOfAKind()
            const additional = this.pairs()

            return {
                name: "FULL HOUSE",
                code: "FULLHOUSE",
                level: 20,
                level: 7,
                multiplier: 7,
                data: this.double(value, additional[0]),
                value,
                additional: additional[0],
                strength: this.strength()
            }
        }
        else if (this.isFlush()) {
            return {
                name: "FLUSH",
                code: "FLUSH",
                level: 5,
                multiplier: 5,
                data: this.flush(),
                strength: this.strength()
            }
        }
        else if (this.isStraight() === "ROYALSTRAIGHT" || this.isStraight() === "STRAIGHT") {
            const straight = this.straight()

            return {
                name: "STRAIGHT",
                code: "STRAIGHT",
                level: 4,
                multiplier: 4,
                data: straight.data,
                strength: straight.strength
            }
        }
        else if (this.isThreeOfAKind()) {

            const value = this.isThreeOfAKind()

            return {
                name: "THREE OF A KIND",
                code: "THREEOFAKIND",
                level: 3,
                multiplier: 3,
                data: this.single(value),
                value,
                strength: this.strength()
            }
        }
        else if (this.pairs().length === 2) {

            const values = this.pairs().sort(this.recompare)

            return {
                name: "TWO PAIRS",
                code: "TWOPAIRS",
                level: 2,
                multiplier: 2,
                data: this.double(values[0], values[1]),
                value: values[0],
                additional: values[1],
                strength: this.strength()
            }
        }
        else if (this.pairs().length === 1) {

            const values = this.pairs()

            return {
                name: "PAIR",
                code: "PAIR",
                level: 1,
                multiplier: 1,
                data: this.single(values[0]),
                value: values[0],
                strength: this.strength()
            }
        }
        else {
            if (this.hasAceKing()) {

                let data = this.noGame()

                return {
                    name: "ACE KING",
                    code: "ACEKING",
                    level: 1,
                    multiplier: 1,
                    data: this.double(data[0].value, data[1].value),
                    value: `1`,
                    strength: this.strength()
                }
            }
            
            return {
                name: "HIGH CARD",
                code: "NOGAME",
                level: 0,
                multiplier: 0,
                data: this.noGame(),
                strength: this.strength()
            }
        }
    }
}


module.exports = Dealer