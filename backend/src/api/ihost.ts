import axios from '@/api/axios';
import { GetIhostTkRes, IhostRequestBody, IhostResponseBody,GetIhostDevicesRes } from '@/interface';

export const getIhostOpenTk = () => {
  return axios.get<any, GetIhostTkRes>('/open-api/v1/rest/bridge/access_token');
};

export const requestIhost = (body: IhostRequestBody) => {
  return axios.post<any, IhostResponseBody>('/open-api/v1/rest/thirdparty/event', body);
};

export const getIhostDevices = () => {
  return axios.get<any, GetIhostDevicesRes>('/open-api/v1/rest/devices');
};

export const disIntegrateIhostDevice = (serialNumber: string) => {
  return axios.delete<any, any>(`/open-api/v1/rest/devices/${serialNumber}`);
};
