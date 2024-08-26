'use strict'

const Game = require("./Game")

class Player extends Game {

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
                bonus: 5000,
                data: this.all(),
                hasAceKing: false,
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
                bonus: 1500,
                data: straight.data,
                hasAceKing: false,
                strength: straight.strength
            }
        }
        else if (this.isFourOfAKind()) {

            const value = this.isFourOfAKind()
            const hasAceKing = this.hasAceKing()
            const multiplier = 20 + (hasAceKing ? 1 : 0)

            return {
                name: "FOUR OF A KIND",
                code: "FOUROFAKIND",
                level: 20,
                multiplier: multiplier,
                bonus: 200,
                data: this.single(value),
                value,
                hasAceKing: hasAceKing,
                strength: this.strength()
            }
        }
        else if (this.isThreeOfAKind() && this.pairs().length === 1) {

            const value = this.isThreeOfAKind()
            const additional = this.pairs()

            return {
                name: "FULL HOUSE",
                code: "FULLHOUSE",
                level: 7,
                multiplier: 7,
                bonus: 70,
                data: this.single(value, true),
                value,
                additional: additional[0],
                hasAceKing: false,
                strength: this.strength()
            }
        }
        else if (this.isFlush()) {
            return {
                name: "FLUSH",
                code: "FLUSH",
                level: 5,
                multiplier: 5,
                bonus: 50,
                data: this.flush(),
                hasAceKing: false,
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
                bonus: 40,
                data: straight.data,
                hasAceKing: false,
                strength: straight.strength
            }
        }
        else if (this.isThreeOfAKind()) {

            const value = this.isThreeOfAKind()
            const hasAceKing = this.hasAceKing()
            const multiplier = 3 + (hasAceKing ? 1 : 0)

            return {
                name: "THREE OF A KIND",
                code: "THREEOFAKIND",
                level: 3,
                multiplier,
                bonus: 10,
                data: this.single(value),
                value,
                hasAceKing,
                strength: this.strength()
            }
        }
        else if (this.pairs().length === 2) {
            const values = this.pairs().sort(this.recompare)
            const hasAceKing = this.hasAceKing("TWOPAIRS")
            const multiplier = 2 + (hasAceKing ? 1 : 0)

            return {
                name: "TWO PAIRS",
                code: "TWOPAIRS",
                level: 2,
                multiplier,
                data: this.double(values[0], values[1]),
                value: values[0],
                additional: values[1],
                hasAceKing,
                strength: this.strength()
            }
        }
        else if (this.pairs().length === 1) {

            const values = this.pairs()
            const hasAceKing = this.hasAceKing()
            const multiplier = 1 + (hasAceKing ? 1 : 0)

            return {
                name: "PAIR",
                code: "PAIR",
                level: 1,
                multiplier: multiplier,
                data: this.single(values[0]),
                value: values[0],
                hasAceKing,
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
                    hasAceKing: false,
                    strength: this.strength()
                }
            }

            return {
                name: "Hight: " + this.rankList[this.rankList.length - 1],
                code: "NOGAME",
                level: 0,
                multiplier: 0,
                data: this.noGame(),
                hasAceKing: false,
                strength: this.strength()
            }
        }
    }
}


module.exports = Player