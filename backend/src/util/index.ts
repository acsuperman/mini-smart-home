import { ERequestIhostHeadName, ECapabilityType, EThermostatTargetSetpointSubName,EDirectiveResponseHeadName } from '@/enum';
import { cloudSideUserInfo,wsClient } from '@/store';
import { ThermostatCapabilities, WeeklyEntry, WeeklySchedule } from '@/interface';
import { WEEKLY_SCHEDULE_PARAM_KEYS, WEEKLY_SCHEDULE_DAY_NAMES,dispatchLongLinkUrlMap } from '@/common';
import crypto from 'node:crypto';
import { getLongLinkInfo } from '@/api/cloud';
import { useWebSocket } from '@/common/websocket';

export const errorLogAndExit = (meesage: string, data: any = '') => {
  console.error(meesage, data);
  process.exit(0);
};

export const generateUuidV4 = (): string => crypto.randomUUID();

export const generateRequestIhostHeadObject = (name: ERequestIhostHeadName) => {
  return {
    name,
    message_id: generateUuidV4(),
    version: '1',
  };
};

export const generateWsData = (params,deviceId) => ({
  action: 'update',
  apikey: cloudSideUserInfo.userInfo.apikey,
  deviceid: deviceId,
  params,
  userAgent: 'app',
  sequence: Date.now().toString(),
});

const parseDayHexSchedule = (hex: string): WeeklyEntry[] => {
  const result: WeeklyEntry[] = [];

  for (let i = 0; i < hex.length; i += 8) {
    result.push({
      startTimeInMinutes: parseInt(hex.slice(i, i + 4), 16),
      upperSetpoint: parseInt(hex.slice(i + 4, i + 8), 16) / 10,
    });
  }

  return result;
};

const SCHEDULE_ENTRY_HEX_LENGTH = 8;
const DAY_SCHEDULE_HEX_LENGTH = 48;

const formatDayHexSchedule = (entries: WeeklyEntry[]): string => {
  const hex = entries.map(e =>
    e.startTimeInMinutes.toString(16).padStart(4, '0')
    + Math.round(e.upperSetpoint * 10).toString(16).padStart(4, '0'),
  ).join('');

  if (hex.length === DAY_SCHEDULE_HEX_LENGTH) return hex;

  // 时段不足 6 条时，用最后一个时段反复补齐
  const lastEntry = hex.slice(-SCHEDULE_ENTRY_HEX_LENGTH);
  const padding = lastEntry.repeat((DAY_SCHEDULE_HEX_LENGTH - hex.length) / SCHEDULE_ENTRY_HEX_LENGTH);

  return (hex + padding);
};

export const findAutoModeCapa = (capabilities: ThermostatCapabilities[]) =>
  capabilities.find(
    c => c.capability === ECapabilityType.THERMOSTAT_TARGET_SETPOINT
      && c.name === EThermostatTargetSetpointSubName.AUTO_MODE,
  );

/** params 中的日程 hex → capabilities AUTO_MODE 的 weeklySchedule */
export const paramsToWeeklySchedule = (
  capabilities: ThermostatCapabilities[],
  params: Record<string, any>,
): void => {
  const autoCapa = findAutoModeCapa(capabilities);
  const weeklySchedule = autoCapa!.configuration!.weeklySchedule;

  if (!autoCapa?.configuration) return;

  for (let i = 0; i < WEEKLY_SCHEDULE_PARAM_KEYS.length; i++) {
    const hex = params[WEEKLY_SCHEDULE_PARAM_KEYS[i]] ;

    if (hex)
      weeklySchedule[WEEKLY_SCHEDULE_DAY_NAMES[i]] = parseDayHexSchedule(hex);
    else
      delete weeklySchedule[WEEKLY_SCHEDULE_DAY_NAMES[i]];
  }

};

/** capabilities AUTO_MODE weeklySchedule → 日程 hex params */
export const weeklyScheduleToHexParams = (
  capabilities: ThermostatCapabilities[],
): Record<string, string> => {
  const autoCapa = findAutoModeCapa(capabilities);
  const schedule = autoCapa?.configuration?.weeklySchedule;
  const params = {};

  for (let i = 0; i < WEEKLY_SCHEDULE_PARAM_KEYS.length; i++) {
    const dayName = WEEKLY_SCHEDULE_DAY_NAMES[i];
    const entries = schedule?.[dayName];

    params[WEEKLY_SCHEDULE_PARAM_KEYS[i]] = entries?.length ? formatDayHexSchedule(entries) : '';
  }

  return params;
};

const getLongLink = async () => {
  const data = await getLongLinkInfo(dispatchLongLinkUrlMap[cloudSideUserInfo.region]);

  cloudSideUserInfo.longLinkInfo = data;
};

const connectWebSocket = () => {
  const { domain, port } = cloudSideUserInfo.longLinkInfo;

  if (!domain || port <= 0) return;
  Object.assign(wsClient, useWebSocket(domain, port, {
    at: cloudSideUserInfo.accessToken,
    apikey: cloudSideUserInfo.userInfo.apikey,
    appid: process.env.APPID as string,
  }));

  wsClient.connect();
};

export const getAndConnectWsUrl = async () => {
  await getLongLink();
  connectWebSocket();
};

export const generateRes = (error,message,data) => ({ error,message,data });

export const toIhostResHeader = (name: EDirectiveResponseHeadName, message_id: string) => ({
  name,
  message_id,
  version: '1',
});
