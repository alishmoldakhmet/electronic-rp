const axios = require('axios')
const { STARTPOINT } = require("../config/integration")


/* BALANCE */
const balance = (uri, data) => {
    const link = uri ? uri : `${STARTPOINT}/api/makao_card_games/ow/balance`
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    console.log(link, data)
    return axios.post(link, data, headers).then(response => response).catch(data => data.response)
}

/* DEBIT */
const sendDebit = (uri, data) => {
    const link = uri ? uri : `${STARTPOINT}/api/makao_card_games/ow/debit`
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    console.log(link, data)
    return axios.post(link, data, headers).then(response => response).catch(data => data.response)
}

/* CREDIT */
const sendCredit = (uri, data) => {
    const link = uri ? uri : `${STARTPOINT}/api/makao_card_games/ow/credit`
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    console.log(link, data)
    return axios.post(link, data, headers).then(response => response).catch(data => data.response)
}

module.exports = { balance, sendDebit, sendCredit }