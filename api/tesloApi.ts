import axios from 'axios';

const tesloApi = axios.create({ // Instancia de petición a endpoint '/api'
    baseURL: '/api'
});

export default tesloApi