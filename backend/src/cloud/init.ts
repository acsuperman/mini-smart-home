import { cloudSideUserInfo, wsClient, ihostSideUserInfo } from '@/store';
import { getAndConnectWsUrl } from '@/util';

export const connectEWeLink = async () => {
  if (!cloudSideUserInfo.accessToken)
    return ;
  await getAndConnectWsUrl();

};
