const axios = require('axios')

/* BALANCE */
const balance = (uri, data) => {
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

/* DEBIT */
const sendDebit = (uri, data) => {
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

/* CREDIT */
const sendCredit = (uri, data) => {
    const headers = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

module.exports = { balance, sendDebit, sendCredit }