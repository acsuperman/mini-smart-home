import { saveUser } from '@/db';
import { cloudSideUserInfo, wsClient } from '@/store';
import { generateRes } from '@/util';

export default function logout(req,res) {
  wsClient.close();
  cloudSideUserInfo.accessToken = '';
  cloudSideUserInfo.refreshToken = '';
  cloudSideUserInfo.region = '';
  cloudSideUserInfo.userInfo.apikey = '';
  saveUser();
  res.json(generateRes(0,'',{}));

}
