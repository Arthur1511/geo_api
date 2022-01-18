// import axios from 'axios';

// const api = axios.create({
//     baseURL: 'http://localhost:5003'
// });

// export default api;

import axios from 'axios'

const API_CLIENT_TIMEOUT = 100000 // Milliseconds
const SRID = 4326

class ApiClient {
    constructor() {
        const APPLICATION_JSON_MIME_TYPE = 'application/json'

        this.instance = axios.create({
            baseURL: 'http://localhost:5003',
            timeout: API_CLIENT_TIMEOUT,
            headers: {
                common: { Accept: APPLICATION_JSON_MIME_TYPE },
                post: { 'Content-Type': APPLICATION_JSON_MIME_TYPE },
                put: { 'Content-Type': APPLICATION_JSON_MIME_TYPE },
            },
        })

    }

    async get(url, config = {}) {
        return this.instance.get(url, config)
    }

    async post(url, data = {}, config = {}) {
        return this.instance.post(url, JSON.stringify(data), config)
    }

    async put(url, data = {}, config = {}) {
        return this.instance.put(url, JSON.stringify(data), config)
    }

    async getPlaceGeocoding(config) {
        console.log('config', config)
        const url = `/busca/lugares?nome=${config.nome}&srid=${SRID}`
        return this.instance.get(url)
        //return this.get(url, config)
    }

    async getAddressGeocoding(config) {
        console.log('config', config)
        const url = `/busca/enderecos?end=${config.end}&exato=False&threahold=0.8&srid=${SRID}`
        return this.instance.get(url)
    }

    async getPlaceReverseGeocoding(config) {
        console.log('config', config)
        const url = `/busca/lugares/geocodificacao_reversa?lat=${config.lat}&long=${config.long}&limite=${config.limite}&srid=${SRID}`
        return this.instance.get(url)
    }

    async getAddressReverseGeocoding(config) {
        console.log('config', config)
        const url = `/busca/enderecos/geocodificacao_reversa?lat=${config.lat}&long=${config.long}&limite=${config.limite}&srid=${SRID}`
        return this.instance.get(url)
    }
}

export default ApiClient