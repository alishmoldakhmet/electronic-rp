
const Six = require('./Six')


class Additional {

    list = []

    constructor(data) {

        this.list = [
            ...new Six(data.filter((_, index) => index !== 0)).hand(),
            ...new Six(data.filter((_, index) => index !== 1)).hand(),
            ...new Six(data.filter((_, index) => index !== 2)).hand(),
            ...new Six(data.filter((_, index) => index !== 3)).hand(),
            ...new Six(data.filter((_, index) => index !== 4)).hand(),
            ...new Six(data.filter((_, index) => index !== 5)).hand()
        ]
    }

    multiplier = (a, b) => {
        const av = parseInt(a.multiplier)
        const bv = parseInt(b.multiplier)

        if (av < bv)
            return 1

        if (av > bv)
            return -1

        return 0
    }

    value = (a, b) => {

        if (!a.value || !b.value) {
            return 0
        }

        const av = parseInt(a.value)
        const bv = parseInt(b.value)

        if (av < bv)
            return 1

        if (av > bv)
            return -1

        return 0
    }

    strength = (a, b) => {
        const av = parseInt(a.strength)
        const bv = parseInt(b.strength)

        if (av < bv)
            return 1

        if (av > bv)
            return -1

        return 0
    }


    get = () => {

        const hands = this.list.sort(this.strength).sort(this.value).sort(this.multiplier)

        let ranks = []
        let results = []

        if (hands.length > 0) {
            hands.forEach((hand, index) => {
                let rank = []
                hand.data.forEach(card => {
                    if (card.status) {
                        rank.push(parseInt(card.value))
                        let split = card.name.split(' ')
                    }
                })
                if (rank.length > 0) {
                    ranks.push({ index, rank, level: hand.level, code: hand.code, name: hand.name })
                }
            })
        }

        if (ranks.length > 0) {

            const first = ranks[0]

            ranks.forEach((item, index) => {
                if (index > 0) {

                    let rank = item.rank

                    if (rank.length === first.rank.length) {

                        if (first.code === 'ROYALFLUSH' || first.code === 'STRAIGHTFLUSH') {
                            if (item.code === "STRAIGHT") {
                                results.push(item)
                            }
                        }

                        if (!this.isEqual(rank, first.rank)) {
                            results.push(item)
                        }
                    }

                    if (rank.length > first.rank.length) {
                        if (!this.isEqual(rank, first.rank)) {
                            results.push(item)
                        }
                    }

                    if (rank.length < first.rank.length) {

                        if (rank.length === 2 && (first.code === "STRAIGHT" || first.code === "FLUSH")) {
                            if (!rank.every(element => first.rank.includes(element) && rank.indexOf(element) === rank.lastIndexOf(element))) {
                                results.push(item)
                            }
                        }
                        else {
                            if (first.code !== "FULLHOUSE") {
                                if (!rank.every(element => first.rank.includes(element))) {
                                    results.push(item)
                                }
                            }
                        }
                    }

                }
            })

            results.unshift(first)
        }


        let combinations = []
        if (results.length > 0) {
            hands.forEach((combination, index) => {
                results.forEach(result => {
                    if (result.index === index) {
                        combinations.push(combination)
                    }
                })
            })
        }

        return combinations
    }



    isEqual = (first, second) => {

        if (first.length === second.length) {
            return first.every((element, index) => element === second[index])
        }

        return false
    }

}

module.exports = Additional