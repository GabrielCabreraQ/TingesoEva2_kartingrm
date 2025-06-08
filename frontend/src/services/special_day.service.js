import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/specialdays/');
}

const create = specialday => {
    return httpClient.post("/api/specialdays/", specialday);
}

const get = id => {
    return httpClient.get(`/api/specialdays/${id}`);
}

const update = specialday => {
    return httpClient.put('/api/specialdays/', specialday);
}

const remove = id => {
    return httpClient.delete(`/api/specialdays/${id}`);
}

const isSpecialDay = date => {
    return httpClient.get(`/api/specialdays/isSpecialDay/${date}`);
}
export default { getAll, create, get, update, remove, isSpecialDay};

