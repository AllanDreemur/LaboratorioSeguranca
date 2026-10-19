import axios from "axios";

axios.defaults.withCredentials = true;

let csrfToken = "";

axios.interceptors.request.use(async (config) => {
    const metodo = (config.method || "get").toLowerCase();
    const alteraDados = ["post", "put", "patch", "delete"].includes(metodo);
    const buscaToken = config.url?.includes("/usuario/csrf-token");

    if (alteraDados && !buscaToken) {
        if (!csrfToken) {
            const resposta = await axios.get<{ csrfToken: string }>("/usuario/csrf-token");
            csrfToken = resposta.data.csrfToken;
        }
        config.headers.set("X-CSRF-Token", csrfToken);
    }

    return config;
});
