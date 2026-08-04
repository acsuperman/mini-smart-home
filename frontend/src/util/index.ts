import { WEEKLY_SCHEDULE_DAY_NAMES, WEEKLY_SCHEDULE_PARAM_KEYS } from "@/common";
import { EThermostatWorkMode, EWeekDay } from "@/enum";
import type {WeeklyEntry} from "@/interface"
import _ from 'lodash'

export const getThermostatChineseName = (mode: EThermostatWorkMode) => {
    switch (mode) {
        case EThermostatWorkMode.MANUAL:
            return '手动模式';
        case EThermostatWorkMode.AUTO:
            return '智能模式';
        case EThermostatWorkMode.ECO:
            return '节能模式';
        case EThermostatWorkMode.BOOST:
            return 'Boost模式';
        case EThermostatWorkMode.TIMER:
            return '定时模式';
        default:
            return '';
    }
};

const parseDayHexSchedule = (hex: string): WeeklyEntry[] => {
  let result: WeeklyEntry[] = [];

  for (let i = 0; i < hex.length; i += 8) {
    result.push({
      startTimeInMinutes: parseInt(hex.slice(i, i + 4), 16),
      upperSetpoint: parseInt(hex.slice(i + 4, i + 8), 16) / 10,
    });
  }
  result = _.uniqBy(result, (item) => item.startTimeInMinutes);
  result.sort((a, b) => a.startTimeInMinutes! - b.startTimeInMinutes!);

  return result;
};

export const paramsToWeeklySchedule = (
  params: Record<string, any>,
) => {
  const weeklySchedule = {} as Record<string,Array<WeeklyEntry>>
  for (let i = 0; i < WEEKLY_SCHEDULE_PARAM_KEYS.length; i++) {
    const hex = params[WEEKLY_SCHEDULE_PARAM_KEYS[i]] ;
    if (hex)
      weeklySchedule[WEEKLY_SCHEDULE_DAY_NAMES[i]] = parseDayHexSchedule(hex);
  }

  return weeklySchedule
};

const formatDayHexSchedule = (entries: WeeklyEntry[]): string =>
  entries.map(e =>
    e.startTimeInMinutes!.toString(16).padStart(4, '0')
    + Math.round(e.upperSetpoint! * 10).toString(16).padStart(4, '0'),
  ).join('');


export const weeklyScheduleToHexParams = (
  schedule:Record<EWeekDay, WeeklyEntry[]>
): Record<string, string> => {

  const params = {} as Record<string,string>;

  for (let i = 0; i < WEEKLY_SCHEDULE_PARAM_KEYS.length; i++) {
    const dayName = WEEKLY_SCHEDULE_DAY_NAMES[i];
    const entries = schedule[dayName];

    const hex = entries?.length ? formatDayHexSchedule(entries) : '';
    // 每个 value 字符串长度须为 48，不足 48 时用现有字符串的最后 8 位不断填充
    params[WEEKLY_SCHEDULE_PARAM_KEYS[i]] = padDayHexTo48(hex);
  }

  return params;
};

/** 若 hex 长度不足 48，用其最后 8 位不断填充，直到 48 位 */
const padDayHexTo48 = (hex: string): string => {
  const last8 = hex.slice(-8);
  while (hex.length < 48) {
    hex += last8.slice(0, 48 - hex.length);
  }
  return hex;
};

export function getWeekDayName(weekDay: number) {
    switch (weekDay) {
        case 0:
            return '星期日';
        case 1:
            return '星期一';
        case 2:
            return '星期二';
        case 3:
            return '星期三';
        case 4:
            return '星期四';
        case 5:
            return '星期五';
        case 6:
            return '星期六';
    }
}
