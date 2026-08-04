import { cloudSideUserInfo, wsClient } from '@/store';
import { LoginResponse } from '@/interface';
import { userLogin } from '@/api/cloud';
import { regionMap } from '@/common/index';
import { generateRes, getAndConnectWsUrl } from '@/util';
import { saveUser } from '@/db';
import { cloud2IHostAndFrontend } from '@/util/cloud2IHostAndFrontend';

export default async function cloudSideLogin(req,res) {

  const { account, password, countryCode } = req.body;
  let loginResponse: LoginResponse;

  cloudSideUserInfo.region = regionMap.find(record => record.countryCode === countryCode)?.region || 'cn';
  try {
    loginResponse = await userLogin(account, password, countryCode);
  } catch (error) {
    return res.json(error);
  }

  const innerData = loginResponse.data;

  cloudSideUserInfo.accessToken = innerData.at;
  cloudSideUserInfo.refreshToken = innerData.rt;
  cloudSideUserInfo.userInfo = innerData.user;
  saveUser();
  wsClient.close();
  try {
    await getAndConnectWsUrl();
  } catch (error) {
    res.json(generateRes(1,'ws建联失败',{}));
  }

  cloud2IHostAndFrontend();

  res.json(generateRes(0,'',{}));

}
