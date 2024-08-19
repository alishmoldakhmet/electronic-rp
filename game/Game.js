'use strict'

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"]



class Game {

    rankList = []
    suitList = []
    list = []


    constructor(data) {
        if (data && Array.isArray(data) && data.length === 5) {
            this.start(data)
            this.init()
        }
    }


    /* Start data with sort */
    start = data => {

        let list = []

        for (let i = 0; i < RANKS.length; i++) {
            for (let j = 0; j < data.length; j++) {

                if (parseInt(RANKS[i]) === parseInt(data[j].value)) {
                    list.push({
                        id: data[j].id,
                        name: data[j].name,
                        image: data[j].image,
                        value: data[j].value
                    })
                }

            }
        }


        this.list = list
    }




    /* Init Suit lists and Rank lists */
    init = () => {

        if (this.list.length > 0) {

            let rankList = []
            let suitList = []

            for (let i = 0; i < this.list.length; i++) {

                const suitSplit = this.list[i].name.split(' ')
                const suitName = suitSplit[0]

                const rankName = this.list[i].value

                rankList.push(rankName)
                suitList.push(suitName)
            }

            this.rankList = rankList
            this.suitList = suitList
        }
    }




    /* Suit counter helper */
    countSuites = suitList => {
        let suitCount = {}

        suitList.forEach(x => {
            suitCount[x] = (suitCount[x] || 0) + 1
        })

        return suitCount
    }




    /* Rank counter helper */
    countRanks = rankList => {
        let rankCount = {}

        rankList.forEach(x => {
            rankCount[x] = (rankCount[x] || 0) + 1
        })

        return rankCount
    }




    /* FLUSH Determiner */
    isFlush = () => {
        const cS = this.countSuites(this.suitList)

        if (Object.keys(cS).find(key => cS[key] === 5)) {
            return true
        }

        return false
    }




    /* STRAIGHT Determiner */
    isStraight = () => {

        const index = RANKS.indexOf(`${this.rankList[0]}`)
        const ref = RANKS.slice(index, index + 5).join("-")
        const section = this.rankList.slice(0).join("-")

        if (section === "10-11-12-13-14" && section === ref) {
            return "ROYALSTRAIGHT"
        }
        else if (section === "2-3-4-5-14" || section === ref) {
            return "STRAIGHT"
        }
        else {
            return "FALSE"
        }
    }




    /* PAIR COUNT Determiner */
    pairs = () => {
        const rS = this.countRanks(this.rankList)

        let result = Object.keys(rS).filter(key => rS[key] === 2)

        return result
    }




    /* THREE OF A KIND Determiner */
    isThreeOfAKind = () => {
        const rS = this.countRanks(this.rankList)
        return Object.keys(rS).find(key => rS[key] === 3)
    }





    /* FOUR OF A KIND Determiner */
    isFourOfAKind = () => {
        const rS = this.countRanks(this.rankList)
        return Object.keys(rS).find(key => rS[key] === 4)
    }





    /* ACE KING Determiner */
    hasAceKing = (combination = "") => {
        const rS = this.countRanks(this.rankList)

        if ('13' in rS && '14' in rS) {

            if (combination === "TWOPAIRS") {
                if (rS['13'] === 2 && rS['14'] === 2) {
                    return false
                }
            }

            return true
        }

        return false
    }





    /* Strength */
    strength = () => {

        let strength = 0

        this.list.forEach((item, index) => {
            strength += Math.pow(14, index + 1) * item.value
        })

        return strength
    }




    /* Compare value sort */
    compare = (a, b) => {
        const av = parseInt(a.value)
        const bv = parseInt(b.value)

        if (av < bv) {
            return 1
        }
        if (av > bv) {
            return -1
        }

        return 0
    }





    /* Reverse sort */
    recompare = (a, b) => {

        if (parseInt(a) < parseInt(b)) {
            return 1
        }
        if (parseInt(a) > parseInt(b)) {
            return -1
        }

        return 0
    }




    /* Get data with single combination */
    single = (value, status = false) => {

        let main = []
        let extra = []


        this.list.forEach(item => {
            if (parseInt(item.value) === parseInt(value)) {
                main.push({ ...item, status: true })
            }
            else {
                extra.push({ ...item, status })
            }
        })


        return [...main, ...extra.sort(this.compare)]
    }




    /* Get data with double combinations */
    double = (first, second) => {

        let main = []
        let additional = []
        let extra = []

        this.list.forEach(item => {
            if (parseInt(item.value) === parseInt(first)) {
                main.push({ ...item, status: true })
            }
            else if (parseInt(item.value) === parseInt(second)) {
                additional.push({ ...item, status: true })
            }
            else {
                extra.push({ ...item, status: false })
            }
        })


        return [...main, ...additional, ...extra.sort(this.compare)]
    }





    /* Combinations that involve all cards */
    all = () => {

        let data = []

        this.list.forEach(item => {
            data.push({ ...item, status: true })
        })

        return data
    }


    /* Combinations that involve all cards */
    noGame = () => {

        let data = []

        this.list.forEach(item => {
            data.push({ ...item, status: false })
        })

        return data.sort(this.compare)
    }





    /* FLUSH data */
    flush = () => {

        let data = []

        this.list.forEach(item => {
            data.push({ ...item, status: true })
        })

        return data.sort(this.compare)
    }



    /* STRAIGHT data */
    straight = () => {

        let data = []
        let isAce = false
        let strength = 0

        const section = this.rankList.slice(0).join("-")

        if (section === "2-3-4-5-14") {
            isAce = true
        }

        this.list.forEach(item => {
            data.push({ ...item, status: true })
        })

        if (isAce) {
            data.unshift(data.pop())
        }

        data.forEach((item, index) => {
            if (isAce) {
                strength += Math.pow(14, index + 1)
            }
            else {
                strength += Math.pow(14, index + 1) * item.value
            }
        })

        return {
            data,
            strength
        }
    }

}



module.exports = Game