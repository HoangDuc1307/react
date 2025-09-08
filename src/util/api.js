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

const createProductApi = (name, price, imageUrl, category) => {
    const URL_API = "v1/api/product/";
    const data = {
        name,
        price,
        imageUrl,
        category
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

// Variant APIs
export const getVariantsApi = (productId) => {
    const URL_API = `v1/api/product/${productId}/variants`;
    return axios.get(URL_API);
}

export const upsertVariantsApi = (productId, variants) => {
    const URL_API = `v1/api/product/${productId}/variants`;
    return axios.post(URL_API, { variants });
}

export const deleteVariantApi = (productId, size) => {
    const URL_API = `v1/api/product/${productId}/variants?size=${encodeURIComponent(size)}`;
    return axios.delete(URL_API);
}

// Category config APIs
export const getCategoryConfigApi = (key) => {
    const URL_API = `v1/api/category-config/${key}`;
    return axios.get(URL_API);
}

export const listCategoryConfigsApi = () => {
    const URL_API = `v1/api/category-config`;
    return axios.get(URL_API);
}

export {
    createUserApi, loginUserApi, getUserApi, createProductApi, getProductApi, deleteProductApi, updateProductApi
}