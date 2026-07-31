import { getIhostOpenTk } from '@/api/ihost';
import { saveUser } from '@/db';
import { cloudSideUserInfo, ihostSideUserInfo } from '@/store';
import { generateRes } from '@/util';

export default function getOpenToken(req,res) {
  getIhostOpenTk().then(openTkRes => {
    ihostSideUserInfo.openToken = openTkRes.data.token;
    saveUser();
    res.json(generateRes(0,'',{}));
  }).catch(error => {
    res.json(error);
  });
}
