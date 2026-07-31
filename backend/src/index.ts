import 'dotenv/config';
import express, { Express } from 'express';
import { connectEWeLink } from '@/cloud/init';
import { connectIhost } from './ihost/init';
import { integrateThermostatIntoIHost } from '@/ihost/integrateThermostatIntoIHost';
import { syncThermostat } from './sync';
import { errorLogAndExit } from './util';
import router from './routes';
const FRONTEND_SECRET = process.env.FRONTEND_SECRET;
const app: Express = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

app.use((req, res, next) => {
  const isApi = req.path.startsWith('/api');
  const exclude = ['/api/dealIhostDirective'];

  if (isApi && !exclude.includes(req.path) && req.headers.authorization !== `Bearer ${FRONTEND_SECRET}`) {
    return res.status(401).json({ error: 401, msg: '未授权请求' });
  }

  next();
});

app.use('/api', router);

const init = () => {
  connectEWeLink();
};

// const init = async () => {
//   try {
//     await Promise.all([connectEWeLink(),connectIhost()]);
//   } catch (error) {
//     errorLogAndExit('初始连接失败',error);
//   }

//   integrateThermostatIntoIHost();
//   syncThermostat(app);

// };

init();

app.listen(port, () => {

});
