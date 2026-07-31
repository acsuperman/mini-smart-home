import { getFamilyDeviceList } from '@/api/cloud';
import { getAllDevices } from '@/db';

export default function getFamilyThing(req,res) {
  const dbDvicesMap = new Map();

  getAllDevices().forEach(item => {
    dbDvicesMap.set(item.thirdSerialNumber,item.serialNumber);
  });
  getFamilyDeviceList(req.query.familyid).then(deviceRes => {
    deviceRes.data.thingList.forEach(item => {
      const itemData = item.itemData;

      itemData.ihostSideSerialNumber = dbDvicesMap.get(itemData.deviceid) ? dbDvicesMap.get(itemData.deviceid) : '';
    });

    return res.json(deviceRes);
  }).catch(error => res.json(error));
  
}
