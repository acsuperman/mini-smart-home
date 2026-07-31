import axios, { type InternalAxiosRequestConfig } from "axios";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";

const api = axios.create();
const apiNoDoubleData = [] as Array<string>

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    config.headers["Authorization"] = `Bearer ${import.meta.env.VITE_SECRET}`;
    return config;
});

api.interceptors.response.use(response => {
    const userStore = useUserStore();
    if (response.data.error !== 0) {
        ElMessage.error(response.data.msg)
        const error = response.data.error
        if (error === 401) {
            //ac认证失败,通常是账号被其他人登录，直接注销
            userStore.logout()
        }
        else if (error === 402) {
            //ac过期，在这里进行无感刷新，由于刷新接口当前appid没权限，所以现在直接执行注销逻辑，直接去重新登录
            userStore.logout()
        }
        return Promise.reject(response.data)
    }
    if (response.config.url && apiNoDoubleData.includes(response.config.url)) {
        return response.data;
    }
    return response.data.data;
}, error => {
    // if (error.response?.status === 401) {
    //     useUserStore().logout();
    // }
    // console.error("API Error:", error);
    return error;
});

export default api;