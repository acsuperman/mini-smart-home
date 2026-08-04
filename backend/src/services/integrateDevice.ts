import { requestIhost } from '@/api/ihost';
import { initThermostatCapabilities } from '@/common';
import { upsertDevice } from '@/db';
import { EAdaptiveRecoveryStatus, ERequestIhostHeadName, EThermostatSubName, EThermostatTargetSetpointSubName, EThermostatWorkMode } from '@/enum';
import { DiscoveryResponsePayload, IhostRequestBody, ItemData } from '@/interface'; 
import { generateRequestIhostHeadObject, generateRes, paramsToWeeklySchedule } from '@/util';
import { inspect } from 'node:util';
import { sendSseToAll } from './sseBridge';

export default function integrateDevice(req,res) {
  const device: ItemData = req.body;

  if (device.extra.uiid !== 7017) {
    res.json(generateRes(1, '不支持的设备类型',{}));

    return;
  }

  const params = device.params;

  const endpoint = {
    name: device.name,
    third_serial_number: device.deviceid,
    display_category: 'thermostat',
    capabilities: initThermostatCapabilities,
    state: {
      thermostat: {
        [EThermostatSubName.THERMOSTAT_MODE]: {
          thermostatMode: EThermostatWorkMode[Number(params.workMode)],
        },
        [EThermostatSubName.ADAPTIVE_RECOVERY_STATUS]: {
          adaptiveRecoveryStatus: EAdaptiveRecoveryStatus[Number(params.workState)],
        },
      },
      'thermostat-target-setpoint': {
        [EThermostatTargetSetpointSubName.MANUAL_MODE]: { targetSetpoint: params.manTargetTemp / 10 },
        [EThermostatTargetSetpointSubName.AUTO_MODE]: { targetSetpoint: (params.autoTargetTemp ?? 0) / 10 },
        [EThermostatTargetSetpointSubName.ECO_MODE]: { targetSetpoint: params.ecoTargetTemp / 10 },
      },
    },
    manufacturer: device.extra.manufacturer,
    model: device.extra.model,
    tags: {},
    firmware_version: device.params.fwVersion,
    service_address: 'http://' + process.env.SERVER_IP! + ':' + process.env.SERVER_PORT + '/api/dealIhostDirective',
  };

  paramsToWeeklySchedule(endpoint.capabilities, params);
  const integrateThermostatIntoIHost: IhostRequestBody = {
    event: {
      header: generateRequestIhostHeadObject(ERequestIhostHeadName.DISCOVERY_REQUEST),
      payload: { endpoints: [endpoint] },
    },
  };

  console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:同步新设备', inspect(integrateThermostatIntoIHost, { depth: null, colors: true }));
  requestIhost(integrateThermostatIntoIHost).then((integrateRes) => {
    const targetDevice = (integrateRes.payload as DiscoveryResponsePayload).endpoints[0];

    upsertDevice(targetDevice.third_serial_number, targetDevice.serial_number);
    sendSseToAll('deviceStatusChange', { deviceid: targetDevice.third_serial_number,params: { ihostSideSerialNumber: targetDevice.serial_number } });
    res.json(generateRes(0, '同步成功', {}));
  }).catch((error) => {
    res.json(generateRes(1, '同步失败，请稍后再试', { error }));
  });

}
