import axios from "./axios.custiomize";

const createUserApi = (name, email, password) => {
    const URL_API = "v1/api/register";
    const data = {
        name,
        email,
        password
    };
    return axios.post(URL_API, data)
}

const loginUserApi = (email, password) => {
    const URL_API = "v1/api/login";
    const data = {
        email,
        password
    };
    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "v1/api/user";
    return axios.get(URL_API)
}

const createProductApi = (name, price, imageUrl) => {
    const URL_API = "v1/api/product/";
    const data = {
        name,
        price,
        imageUrl
    };
    return axios.post(URL_API, data)
}

const getProductApi = () => {
    const URL_API = "v1/api/product";
    return axios.get(URL_API);
}

const deleteProductApi = (id) => {
    const URL_API = `v1/api/product/${id}`;
    return axios.delete(URL_API);
}

const updateProductApi = (id, payload) => {
    const URL_API = `v1/api/product/${id}`;
    return axios.put(URL_API, payload);
}

export {
    createUserApi, loginUserApi, getUserApi, createProductApi, getProductApi, deleteProductApi, updateProductApi
}