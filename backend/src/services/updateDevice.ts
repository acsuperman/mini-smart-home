import { generateRes } from '@/util';
import { ihostSideUserInfo, wsClient } from '@/store';
import { WebSocketMessage } from '@/interface';
import { ERequestIhostHeadName,EDirectiveResponseHeadName } from '@/enum';
import { requestIhost } from '@/api/ihost';
import _ from 'lodash';
import { generateRequestIhostHeadObject, paramsToWeeklySchedule,generateWsData,toIhostResHeader } from '@/util';
import { inspect } from 'node:util';
import { initThermostatCapabilities, thermostatStateParamMappings, WEEKLY_SCHEDULE_PARAM_KEYS } from '@/common';
import { sendSseToAll } from '@/services/sseBridge';
import { getDevice } from '@/db';

export default function updateDevice(req,res) {
  const deviceid = req.params.deviceid;
  const params = req.body;
  const { sendRequest } = wsClient;

  console.log('frontend-->>server via /api/device/:deviceid:设备状态更新', { deviceid,params });

  if (!params) return res.json(generateRes(0, 'params参数为空', {}));;
  
  //cloud部分
  const wsData = generateWsData(params,deviceid);
  
  console.log('server-->>cloud via webSocket:设备状态更新', inspect(wsData, { depth: null, colors: true }));
  
  sendRequest(wsData).then(() => sendSseToAll(deviceid,params)).catch(error => console.log('cloud端更新失败'));
 
  //ihost部分
  if (!ihostSideUserInfo.openToken) 
    return res.json(generateRes(0, '', {}));;
  const targetDevice = getDevice(deviceid || '');

  if (!targetDevice || !targetDevice.serialNumber) {
    return res.json(generateRes(0, '', {}));;
  }

  const state = {} as Record<string, any>;
  let isChangeState = false;
  let isChangeCapability = false;

  for (const { paramKey, set, transform } of thermostatStateParamMappings) {
    if (paramKey in params) {
      isChangeState = true;
      set(state, transform(params[paramKey], true));
    }
  }

  if (isChangeState) {
    const stateRequestBody = {
      event: {
        header: generateRequestIhostHeadObject(ERequestIhostHeadName.DEVICE_STATES_CHANGE_REPORT),
        endpoint: {
          serial_number: targetDevice.serialNumber,
          third_serial_number: targetDevice.thirdSerialNumber,
        },
        payload: {
          state: state,
        },
      },
    };

    requestIhost(stateRequestBody).catch((err) => console.error('ihost 状态上报失败:', inspect(err, { depth: null, colors: true })));
    console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:设备状态更新', inspect(stateRequestBody, { depth: null, colors: true }));
  }

  // 日程
  if (WEEKLY_SCHEDULE_PARAM_KEYS.some(key => key in params)) {
    isChangeCapability = true;
  }

  if (isChangeCapability) {
    const capabilities = _.cloneDeep(initThermostatCapabilities);

    paramsToWeeklySchedule(capabilities, params);
    const capabilityRequestBody = {
      event: {
        header: generateRequestIhostHeadObject(ERequestIhostHeadName.DEVICE_INFORMATION_UPDATED_REPORT),
        endpoint: {
          serial_number: targetDevice.serialNumber,
          third_serial_number: targetDevice.thirdSerialNumber,
        },
        payload: {
          capabilities: capabilities!,
        },
      },
    };

    requestIhost(capabilityRequestBody).catch((err) => console.error('ihost 能力上报失败:', inspect(err, { depth: null, colors: true })));
    console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:设备能力更新', inspect(capabilityRequestBody, { depth: null, colors: true }));
  }

  if (!isChangeState && !isChangeCapability) {
    console.log('暂无支持的paramKey');
  }

  res.json(generateRes(0, '', {}));

}
