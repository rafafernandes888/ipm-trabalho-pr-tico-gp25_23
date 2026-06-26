import type { AxiosInstance } from "axios";

export const useAPI = (): AxiosInstance => {
    const API = inject<AxiosInstance>("api");
    if (!API) {
        throw new Error("Error Initializing Axios Instance");
    }
    return API as AxiosInstance;
}