import { initThermostatCapabilities } from '@/common';
import { ItemData } from '@/interface'; 

export default function integrateDevice(req,res) {
  const device: ItemData = req.body;
  const endpoint = {
    name: device.name,
    third_serial_number: device.deviceid,
    display_category: 'thermostat',
    capabilities: initThermostatCapabilities,
    state: {},
    manufacturer: device.extra.manufacturer,
    model: device.extra.model,
    tags: {},
    firmware_version: device.params.fwVersion,
    service_address: 'http://' + process.env.SERVER_IP! + ':' + process.env.SERVER_PORT + '/api/dealIhostDirective',
  };
  const integrateThermostatIntoIHost: IhostRequestBody = {
    event: {
      header: generateRequestIhostHeadObject(ERequestIhostHeadName.DISCOVERY_REQUEST),
      payload: { endpoints: [shallowCopy] },
    },
  };
}

const { serial_number: _, ...shallowCopy } = thermostat;

const integrateThermostatIntoIHost: IhostRequestBody = {
  event: {
    header: generateRequestIhostHeadObject(ERequestIhostHeadName.DISCOVERY_REQUEST),
    payload: { endpoints: [shallowCopy] },
  },
};

console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:同步新设备', inspect(integrateThermostatIntoIHost, { depth: null, colors: true }));
requestIhost(integrateThermostatIntoIHost).then((res) => {
  thermostat.serial_number = (res.payload as DiscoveryResponsePayload).endpoints[0].serial_number;
});
