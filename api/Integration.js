const axios = require('axios')

/* Integration game action */
const gameAction = (uri, data) => {
    const headers = { headers: { 'content-type': 'application/json' } }
    return axios.post(uri, data, headers).then(response => response).catch(data => data.response)
}

module.exports = { gameAction }