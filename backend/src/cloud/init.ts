import { cloudSideUserInfo } from '@/store';
import { getAndConnectWsUrl } from '@/util';
import { cloud2IHostAndFrontend } from '@/util/cloud2IHostAndFrontend';

export const connectEWeLink = async () => {
  if (!cloudSideUserInfo.accessToken)
    return ;
  await getAndConnectWsUrl();
  cloud2IHostAndFrontend();

};
