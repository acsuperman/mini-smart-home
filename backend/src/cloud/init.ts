import { cloudSideUserInfo, wsClient, ihostSideUserInfo } from '@/store';
import { getAndConnectWsUrl } from '@/util';
import { sendSseToAll } from '@/services/sseBridge';
import { cloud2IHostAndFrontend } from '@/util/cloud2IHostAndFrontend';

export const connectEWeLink = async () => {

  sendSseToAll('connectStatusChange',{ cloudSideConnect: !!cloudSideUserInfo.accessToken,ihostConnect: !!ihostSideUserInfo.openToken });
  if (!cloudSideUserInfo.accessToken)
    return ;
  await getAndConnectWsUrl();
  cloud2IHostAndFrontend();

};
