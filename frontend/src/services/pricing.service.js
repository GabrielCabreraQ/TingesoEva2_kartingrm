import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/pricing/');
}

const getLast = () => {
    return httpClient.get('/api/pricing/last');

}
const create = pricing => {
    return httpClient.post("/api/pricing/", pricing);
}

const get = id => {
    return httpClient.get(`/api/pricing/${id}`);
}

const update = pricing => {
    return httpClient.put('/api/pricing/', pricing);
}

const remove = id => {
    return httpClient.delete(`/api/pricing/${id}`);
}
export default { getAll, create, get, update, remove, getLast};