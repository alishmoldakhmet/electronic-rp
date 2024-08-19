'use strict'

const Game = require("./Game")





class Six extends Game {

    hand = () => {

        if (this.list.length !== 5) {
            return []
        }

        let data = []

        if (this.isFlush() && this.isStraight() === "ROYALSTRAIGHT") {
            data.push({
                name: "Роял Флэш",
                code: "ROYALFLUSH",
                level: 100,
                multiplier: 100,
                data: this.all(),
                strength: this.strength()
            })
        }
        else if (this.isFlush() && this.isStraight() === "STRAIGHT") {

            const straight = this.straight()

            data.push({
                name: "Стрит Флэш",
                code: "STRAIGHTFLUSH",
                level: 50,
                multiplier: 50,
                data: straight.data,
                strength: straight.strength
            })
        }
        else if (this.isFourOfAKind()) {

            const value = this.isFourOfAKind()

            data.push({
                name: "Каре",
                code: "FOUROFAKIND",
                level: 20,
                multiplier: 20,
                data: this.single(value),
                value,
                strength: this.strength()
            })
        }
        else if (this.isThreeOfAKind() && this.pairs().length === 1) {

            const value = this.isThreeOfAKind()
            const additional = this.pairs()

            data.push({
                name: "Фул Хаус",
                code: "FULLHOUSE",
                level: 20,
                level: 7,
                multiplier: 7,
                data: this.single(value, true),
                value,
                additional: additional[0],
                strength: this.strength()
            })
        }
        else if (this.isFlush()) {
            if (this.isStraight() !== "ROYALSTRAIGHT" || this.isStraight() !== "STRAIGHT") {
                data.push({
                    name: "Флэш",
                    code: "FLUSH",
                    level: 5,
                    multiplier: 5,
                    data: this.flush(),
                    strength: this.strength()
                })
            }
        }
        else if (this.isStraight() === "ROYALSTRAIGHT" || this.isStraight() === "STRAIGHT") {
            const straight = this.straight()

            data.push({
                name: "Стрит",
                code: "STRAIGHT",
                level: 4,
                multiplier: 4,
                data: straight.data,
                strength: straight.strength
            })
        }
        else if (this.isThreeOfAKind()) {

            const value = this.isThreeOfAKind()

            data.push({
                name: "Тройка",
                code: "THREEOFAKIND",
                level: 3,
                multiplier: 3,
                data: this.single(value),
                value,
                strength: this.strength()
            })
        }
        else if (this.pairs().length === 2) {

            const values = this.pairs().sort(this.recompare)

            data.push({
                name: "Две пары",
                code: "TWOPAIRS",
                level: 2,
                multiplier: 2,
                data: this.double(values[0], values[1]),
                value: values[0],
                additional: values[1],
                strength: this.strength()
            })
        }
        else if (this.pairs().length === 1) {

            const values = this.pairs()

            data.push({
                name: "Пара",
                code: "PAIR",
                level: 1,
                multiplier: 1,
                data: this.single(values[0]),
                value: values[0],
                strength: this.strength()
            })
        }
        if (this.hasAceKing()) {

            let element = this.noGame()


            data.push({
                name: "Туз Король",
                code: "ACEKING",
                level: 1,
                multiplier: 1,
                data: this.double(element[0].value, element[1].value),
                value: `1`,
                strength: this.strength()
            })
        }

        return data

    }
}


module.exports = Six