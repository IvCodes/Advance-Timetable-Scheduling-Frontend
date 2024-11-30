import axios from 'axios';

const makeApi = () => { 
    const api = axios.create({
        baseURL:import.meta.env.VITE_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;

        });


    return api;

    };

    export default makeApi
