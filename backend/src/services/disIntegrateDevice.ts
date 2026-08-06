import { disIntegrateIhostDevice } from '@/api/ihost';
import { deleteDevice } from '@/db';
import { ItemData } from '@/interface';
import { generateRes } from '@/util';
import { sendSseToAll } from './sseBridge';

export default function disIntegrateDevice(req,res) {
  const device: ItemData = req.body;
    
  if (device.extra.uiid !== 7017) {
    res.json(generateRes(1, '不支持的设备类型',{}));

    return;
  }

  disIntegrateIhostDevice(device.ihostSideSerialNumber).then(() => {

    deleteDevice(device.deviceid);
    res.json(generateRes(0, '终止同步成功',{}));
    sendSseToAll('deviceStatusChange', { deviceid: device.deviceid,params: { ihostSideSerialNumber: '' } });
  }).catch((error) => {
    res.json(generateRes(1, '终止同步失败，请稍后再试', { error }));
  });

}
