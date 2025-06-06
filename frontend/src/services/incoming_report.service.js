import httpClient from "../http-common";

const createLap = (startdate, enddate) => {
        return httpClient.post(`/api/report/laps/${startdate}/${enddate}`);
};


const createGroup = (startdate, enddate) => {
    return httpClient.post(`/api/report/group/${startdate}/${enddate}`);
};

const get = id => {
        return httpClient.get(`/api/report/download/${id}`, {
            responseType: 'blob' // <--- ¡Asegúrate que esta línea esté aquí!
        });
    };

    const getAll = () => {
       return httpClient.get('/api/report/');
   } 

export default { createLap, createGroup, get,getAll };