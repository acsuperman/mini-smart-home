import { getFamilyAndRoomInfo } from '@/api/cloud';

export default async function getFamily(req,res) {
  getFamilyAndRoomInfo().then((cloudRes) => res.json(cloudRes)).catch((error) => res.json(error))
  ;
}
