import axios from "axios";

const kartingrmBackendServer = import.meta.env.VITE_KARTINGRM_BACKEND_SERVER;
const kartingrmBackendPort = import.meta.env.VITE_KARTINGRM_BACKEND_PORT;

console.log(kartingrmBackendServer)
console.log(kartingrmBackendPort)

export default axios.create({
    baseURL: `http://${kartingrmBackendServer}:${kartingrmBackendPort}`,
    headers: {
        'Content-Type': 'application/json'
    }
});


