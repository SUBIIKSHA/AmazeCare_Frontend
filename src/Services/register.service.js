import axios from "axios";
import {baseUrl} from '../environment.dev';

export function registerAPICall(RegisterModel)
{
    const url = baseUrl+'Authentication/Register/Patient';
    console.log(url)
    return axios.post(url,RegisterModel)
}