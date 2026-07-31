import axios from '@/api/axios';
import type {
    loginResponse,
    familyResponse,
    familyDeviceListResponse,
    itemData
} from '@/interface';

export const userLogin = (account: string, password: string, countryCode: string) => {
    let data: { password: string; countryCode: string; account: string} = {
        password,
        countryCode,
        account
    }
    return axios.post<any, loginResponse>("/api/cloudSideConnect", data)
}

export const getFamilyAndRoomInfo = () => {
    return axios.get<any, familyResponse>("/api/v2/family");
}

export const getFamilyDeviceList = (familyid: string) => {
    return axios.get<any, familyDeviceListResponse>(`/api/v2/device/thing`, {
        params: {
            familyid,
            num: 0
        }
    });
}

export const shutoffCloudSideConnect =()=>{
    return axios.post('/api/shutoffCloudSideConnect')
}

export const getOpenToken =()=>{
    return axios.post('/api/openToken')
}

export const integrateDevice =(device:itemData)=>{
    return axios.post('/api/devices/integrate',device)
}

export const disIntegrateDevice =()=>{
    return axios.delete('/api/devices/integrate')
}