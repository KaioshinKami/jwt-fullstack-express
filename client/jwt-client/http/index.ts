import axios from 'axios'
import {config} from "typescript-eslint";
import AuthService from "../services/auth-service.ts";

export const API_URL='http://localhost:5000/api'

const $api=axios.create({
    baseURL: API_URL,
    withCredentials: true
})

$api.interceptors.request.use((config)=>{
    config.headers.Authorization=`Bearer ${localStorage.getItem('token')}`
    return config
})

$api.interceptors.response.use((config)=>{
    return config
}, async (error)=>{
    const originalRequest=error.config
    if(error.response.status==401 && error.config && !error.config._isRetry){
        try {
            originalRequest.isRetry=true
            const response=await axios.get(`${API_URL}/refresh`, {withCredentials:true})
            localStorage.setItem('token', response.data.accessToken)
            return $api.request(originalRequest)
        }
        catch (e) {
            console.log('Не авторизован')
        }
    }
    throw error
}
)
export default $api