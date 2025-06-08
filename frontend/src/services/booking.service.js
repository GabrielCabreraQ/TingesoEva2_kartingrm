import httpClient from "../http-common";


const getAll = () => {
    return httpClient.get('/api/booking/');
}

const get = id => {
    return httpClient.get(`/api/booking/${id}`);
}

const getExcel = id => {
        return httpClient.get(`/api/booking/boleta/download/${id}`, {
            responseType: 'blob' 
        });
    };
    
const getbookingbymonth = month => {
    return httpClient.get(`/api/booking/month/${month}`);
}
const getbookingbyday = day => {
    return httpClient.get(`/api/booking/day/${day}`);
}
const getbookingbyyear = year => {
    return httpClient.get(`/api/booking/year/${year}`);
}

const getbookingbetween = (start, end) => {
    return httpClient.get(`/api/booking/betweendays/${start}/${end}`);
}
 const getbookingdate = (year, month, day) => {
    return httpClient.get(`/api/booking/date/${year}/${month}/${day}`);    
}

const getbookingsbylapsanddate = (laps,month,year) => {
    return httpClient.get(`/api/booking/filter/${laps}/${month}/${year}`);
}

const create = booking => {
    return httpClient.post(`/api/booking/`, booking);
};

const getvisitcount = (clientId, month, year) => {
    return httpClient.get(`/api/booking/visit/${clientId}/${month}/${year}`);
}

const update = booking => {
    return httpClient.put('/api/booking/', booking);
}

const remove = id => {
    return httpClient.delete(`/api/booking/${id}`);
}

export default { getAll, create, get, update, remove, getvisitcount, getbookingbymonth, getbookingbyday, getbookingbyyear, getbookingbetween, getbookingdate,getbookingsbylapsanddate, getExcel };