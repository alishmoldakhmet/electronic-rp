class Winner {

    play = (player, dealer) => {

        /* Max pay */
        let maxPay = parseInt(player.player.maxPay ? player.player.maxPay : 0)

        if (player.insuranceStatus === "win") {
            maxPay = maxPay - player.insurance
        }

        /* Fields */
        const dealerLevel = parseInt(dealer.level)
        const playerLevel = (player.game && player.game.level) ? parseInt(player.game.level) : 0

        const hasInsurance = player.hasInsurance
        const insurance = hasInsurance ? parseInt(player.insurance) : 0

        const playerMultiplier = (player.game && player.game.multiplier) ? parseInt(player.game.multiplier) : 0
        const secondMultiplier = player.second ? parseInt(player.second.multiplier) : 0
        const multiplier = playerMultiplier + secondMultiplier

        const dealerStrength = parseInt(dealer.strength)
        const playerStrength = (player.game && player.game.strength) ? parseInt(player.game.strength) : 0

        const dealerCode = dealer.code
        const playerCode = (player.game && player.game.code) ? player.game.code : ""

        let total = multiplier * parseInt(player.ante) * 2

        if (total > maxPay) {
            total = maxPay
        }

        const BET_LOSE = { result: "lose", reason: "bet", sum: parseInt(player.ante) * 3, hasInsurance, insurance: 0, anteMultiplier: 0, betMultiplier: 0 }
        const BET_WIN = { result: "win", reason: "bet", sum: total + parseInt(player.ante) * 3, hasInsurance, insurance: 0, anteMultiplier: 0, betMultiplier: multiplier }
        const BET_DRAW = { result: "draw", reason: "bet", sum: parseInt(player.ante) * 3, hasInsurance, insurance: 0, anteMultiplier: 0, betMultiplier: 0 }

        /* If the dealer has no game */
        if (dealerLevel === 0) {
            return { result: "win", reason: "nogame", sum: parseInt(player.ante) + parseInt(player.ante) * 3, hasInsurance, insurance: insurance, anteMultiplier: 1, betMultiplier: 0 }
        }

        /* If the dealer card is higher */
        if (dealerLevel > playerLevel) {
            return BET_LOSE
        }

        /* If the player card is higher */
        if (dealerLevel < playerLevel) {
            return BET_WIN
        }

        /* If the dealer's cards and the player's cards are the same */
        if (dealerLevel === playerLevel) {


            /* Cases where cards are a PAIR, ACEKING, THREEOFAKIND OR FOUROFAKIND */
            if (
                (dealerCode === "PAIR" && playerCode === "PAIR") || (dealerCode === "PAIR" && playerCode === "ACEKING") ||
                (dealerCode === "ACEKING" && playerCode === "PAIR") || (dealerCode === "ACEKING" && playerCode === "ACEKING") ||
                (dealerCode === "THREEOFAKIND" && playerCode === "THREEOFAKIND") || (dealerCode === "FOUROFAKIND" && playerCode === "FOUROFAKIND")
            ) {
                const dealerValue = parseInt(dealer.value)
                const playerValue = (player.game && player.game.value) ? parseInt(player.game.value) : 0

                if (dealerValue > playerValue) {
                    return BET_LOSE
                }
                if (dealerValue < playerValue) {
                    return BET_WIN
                }
                if (dealerValue === playerValue) {
                    if (dealerStrength > playerStrength) {
                        return BET_LOSE
                    }
                    if (dealerStrength < playerStrength) {
                        return BET_WIN
                    }
                    if (dealerStrength === playerStrength) {
                        return BET_DRAW
                    }
                }

            }

            /* Cases where cards are TWOPAIRS OR  FULLHOUSE */
            else if ((dealerCode === "TWOPAIRS" && playerCode === "TWOPAIRS") || (dealerCode === "FULLHOUSE" && playerCode === "FULLHOUSE")) {
                const dealerValue = parseInt(dealer.value)
                const playerValue = (player.game && player.game.value) ? parseInt(player.game.value) : 0

                if (dealerValue > playerValue) {
                    return BET_LOSE
                }
                if (dealerValue < playerValue) {
                    return BET_WIN
                }
                if (dealerValue === playerValue) {

                    const dealerAdditional = parseInt(dealer.additional)
                    const playerAdditional = (player.game && player.game.additional) ? parseInt(player.game.additional) : 0

                    if (dealerAdditional > playerAdditional) {
                        return BET_LOSE
                    }
                    if (dealerAdditional < playerAdditional) {
                        return BET_WIN
                    }
                    if (dealerAdditional === playerAdditional) {
                        if (dealerStrength > playerStrength) {
                            return BET_LOSE
                        }
                        if (dealerStrength < playerStrength) {
                            return BET_WIN
                        }
                        if (dealerStrength === playerStrength) {
                            return BET_DRAW
                        }
                    }
                }
            }


            /* OHTHER CASES */
            else {
                if (dealerStrength > playerStrength) {
                    return BET_LOSE
                }
                if (dealerStrength < playerStrength) {
                    return BET_WIN
                }
                if (dealerStrength === playerStrength) {
                    return BET_DRAW
                }
            }

        }

    }

}


module.exports = Winner