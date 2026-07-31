import {
  CloudSideUserInfo,
  WsClient,
  IhostSideUserInfo,
  SseClient,
  MessageHandler,
  WsSendData,
  WebSocketMessage,
} from '@/interface';
import { getUser } from '@/db';

// ====== 启动时从 SQLite 加载持久化数据 ======
const _user = getUser();

// ====== Cloud 侧用户信息 ======
const cloudSideUserInfo: CloudSideUserInfo = {
  region: _user.region,
  accessToken: _user.accessToken,
  refreshToken: _user.refreshToken,
  userInfo: { apikey: _user.apikey },
  longLinkInfo: {
    IP: '',
    port: 0,
    domain: '',
    error: -1,
    reason: '',
  },
};

// ====== WebSocket 客户端=====
const wsClient: WsClient = {
  ws: null,
  onMessage: () => {},
  sendRequest: (data: WsSendData) => Promise.resolve({} as WebSocketMessage),
  connect: () => {},
  close: () => {},
};

// ====== iHost 侧用户信息 ======
const ihostSideUserInfo: IhostSideUserInfo = {
  openToken: _user.openToken, // 三方的 token
};

// ====== SSE 客户端=====
const sseCliet: SseClient = {
  connect: () => {},
  close: () => {},
  essAddEventListener: (eventName: string, dealFun: MessageHandler) => {},
  essRemoveEventListener: (eventName: string, dealFun: MessageHandler) => {},
};

export { cloudSideUserInfo, wsClient, ihostSideUserInfo, sseCliet };
