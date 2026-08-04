import 'dotenv/config';
import { inspect } from 'node:util';
import express, { Express } from 'express';
import { connectEWeLink } from '@/cloud/init';
import router from './routes';

// 兜底：任何未捕获的 Promise reject 都打印出来，而不是崩掉整个进程
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledPromiseRejection:', inspect(reason, { depth: null, colors: true }));
});

const FRONTEND_SECRET = process.env.FRONTEND_SECRET;
const app: Express = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

app.use((req, res, next) => {
  const isApi = req.path.startsWith('/api');
  const exclude = ['/api/dealIhostDirective', '/api/sse/bridge'];

  if (isApi && !exclude.includes(req.path) && req.headers.authorization !== `Bearer ${FRONTEND_SECRET}`) {
    return res.status(401).json({ error: 401, msg: '未授权请求' });
  }

  next();
});

app.use('/api', router);

const init = () => {
  connectEWeLink();
};

init();

app.listen(port, () => {

});
