import AxiosResponse from "axios";
import {IUser} from "../models/IUser";
import $api from "../http/index";

export default class userService{
    static fetchUsers():Promise<AxiosResponse<IUser[]>>{
        return $api.get<IUser[]>('/users')
    }
}