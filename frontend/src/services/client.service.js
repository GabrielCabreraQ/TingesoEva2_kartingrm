import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/client/');
}

const create = client => {
    return httpClient.post("/api/client/", client);
}

const get = id => {
    return httpClient.get(`/api/client/${id}`);
}
const getbyrut = rut => {
    return httpClient.get(`/api/client/rut/${rut}`);
}

const update = client => {
    return httpClient.put('/api/client/', client);
}

const remove = id => {
    return httpClient.delete(`/api/client/${id}`);
}
export default { getAll, create, get, update, remove,getbyrut};