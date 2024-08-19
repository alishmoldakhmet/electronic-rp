const axios = require('axios')
const { STARTPOINT } = require("../config/integration")


/* BALANCE */
const balance = data => {
    const uri = `${STARTPOINT}/api/makao_card_games/ow/balance`
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

/* DEBIT */
const sendDebit = data => {
    const uri = `${STARTPOINT}/api/makao_card_games/ow/debit`
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

/* CREDIT */
const sendCredit = data => {
    const uri = `${STARTPOINT}/api/makao_card_games/ow/credit`
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

module.exports = { balance, sendDebit, sendCredit }