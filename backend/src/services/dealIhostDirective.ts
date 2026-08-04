import { DirectiveRequestBody, DirectiveResponseBody, DirectiveObject, ThermostatCapabilities } from '@/interface';
import { wsClient } from '@/store';
import { EDirectiveResponseHeadName } from '@/enum';
import { Express } from 'express';
import { generateWsData,findAutoModeCapa,weeklyScheduleToHexParams, toIhostResHeader } from '@/util';
import { inspect } from 'node:util';
import { initThermostatCapabilities, thermostatStateParamMappings } from '@/common';
import { sendSseToAll } from './sseBridge';
import _ from 'lodash';

const updateDeviceStates = (directive: DirectiveObject): Promise<DirectiveResponseBody> => {
  const { state } = directive.payload as { state: Record<string, any> };

  console.log('ihost-->>server via /dealIhostDirective:设备状态更新', inspect(state, { depth: null, colors: true }));
  const { sendRequest } = wsClient;

  const params: Record<string, any> = {};

  for (const { paramKey, get, transform } of thermostatStateParamMappings) {
    const val = get(state);

    if (val !== undefined) {
      params[paramKey] = transform(val, false);
    }
  }

  const wsData = generateWsData(params,directive.endpoint.third_serial_number);

  console.log('server-->>cloud via webSocket:设备状态更新', inspect(wsData, { depth: null, colors: true }));

  sendSseToAll('deviceStatusChange', { deviceid: directive.endpoint.third_serial_number, params });
  console.log('server-->>frontend via sse:设备状态更新', inspect({ deviceid: directive.endpoint.third_serial_number, params }, { depth: null, colors: true }));

  return sendRequest(wsData).then(() => ({
    event: {
      header: toIhostResHeader(EDirectiveResponseHeadName.RESPONSE, directive.header.message_id),
      payload: {},
    },
  })).catch(() => ({
    event: {
      header: toIhostResHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, directive.header.message_id),
      payload: { type: 'ENDPOINT_UNREACHABLE' },
    },
  }));
  
};

const configureDeviceCapabilities = (directive: DirectiveObject): Promise<DirectiveResponseBody> => {
  const payload = directive.payload as { capabilities: ThermostatCapabilities[] };
  const { sendRequest } = wsClient;

  console.log('ihost-->>server via /dealIhostDirective:设备能力更新', inspect(payload.capabilities, { depth: null, colors: true }));
  const autoModeCapablity = findAutoModeCapa(payload.capabilities);
  let capabilities;

  if (autoModeCapablity) {
    capabilities = _.cloneDeep(initThermostatCapabilities);

    findAutoModeCapa(capabilities)!.configuration!.weeklySchedule = autoModeCapablity.configuration!.weeklySchedule;
  }
  else
    return Promise.reject({
      event: {
        header: toIhostResHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, directive.header.message_id),
        payload: { type: 'ENDPOINT_UNREACHABLE' },
      },
    });

  const params = weeklyScheduleToHexParams(capabilities);

  const wsData = generateWsData(params,directive.endpoint.third_serial_number);

  console.log('server-->>cloud via webSocket:设备能力更新', inspect(wsData, { depth: null, colors: true }));
  
  sendSseToAll('deviceStatusChange', { deviceid: directive.endpoint.third_serial_number, params });
  console.log('server-->>frontend via sse:设备状态更新', inspect({ deviceid: directive.endpoint.third_serial_number, params }, { depth: null, colors: true }));

  return sendRequest(wsData).then(() => ({
    event: {
      header: toIhostResHeader(EDirectiveResponseHeadName.RESPONSE, directive.header.message_id),
      payload: {},
    },
  })).catch(() => ({
    event: {
      header: toIhostResHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, directive.header.message_id),
      payload: { type: 'ENDPOINT_UNREACHABLE' },
    },
  }));
};

export default async function dealIhostDirective(req,res) {
  const body: DirectiveRequestBody = req.body;
  const { header } = body.directive;

  switch (header.name) {
    case 'UpdateDeviceStates':
      res.json(await updateDeviceStates(body.directive));
      break;
    case 'ConfigureDeviceCapabilities':
      res.json(await configureDeviceCapabilities(body.directive));
      break;
    default:
      res.json({
        event: {
          header: toIhostResHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, header.message_id),
          payload: { type: 'INVALID_DIRECTIVE' },
        },
      });
  }
}
