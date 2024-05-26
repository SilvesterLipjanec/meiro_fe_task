import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000/';

const apiClient = axios.create({
    baseURL: BASE_URL
});

export default apiClient;
