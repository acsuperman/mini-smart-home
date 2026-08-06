import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { cloudSideUserInfo, ihostSideUserInfo } from '@/store';
import { WEEKLY_SCHEDULE_PARAM_KEYS } from '@/common';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'app.db'));

db.pragma('journal_mode = WAL');

// ========== 初始化表结构 ==========

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY DEFAULT 1,
    region          TEXT NOT NULL DEFAULT '',
    access_token    TEXT NOT NULL DEFAULT '',
    refresh_token   TEXT NOT NULL DEFAULT '',
    apikey          TEXT NOT NULL DEFAULT '',
    open_token      TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    third_serial_number TEXT NOT NULL UNIQUE,
    serial_number TEXT NOT NULL DEFAULT '',
    mon  TEXT NOT NULL DEFAULT '',
    tues TEXT NOT NULL DEFAULT '',
    wed  TEXT NOT NULL DEFAULT '',
    thur TEXT NOT NULL DEFAULT '',
    fri  TEXT NOT NULL DEFAULT '',
    sat  TEXT NOT NULL DEFAULT '',
    sun  TEXT NOT NULL DEFAULT ''
  );
`);

// 确保 user 表有初始行（id=1 固定）
db.exec(`
  INSERT OR IGNORE INTO user (id) VALUES (1);
`);

// ========== User ==========

export interface UserRow {
  region: string;
  accessToken: string;
  refreshToken: string;
  apikey: string;
  openToken: string;
}

function rowToUser(row: Record<string, unknown>): UserRow {
  return {
    region: row.region as string,
    accessToken: row.access_token as string,
    refreshToken: row.refresh_token as string,
    apikey: row.apikey as string,
    openToken: row.open_token as string,
  };
}

export function getUser(): UserRow {
  const row = db.prepare('SELECT * FROM user WHERE id = 1').get() as Record<string, unknown>;

  return rowToUser(row);
}

export function saveUser(): void {

  db.prepare(`
    UPDATE user SET
      region          = @region,
      access_token    = @accessToken,
      refresh_token   = @refreshToken,
      apikey          = @apikey,
      open_token      = @openToken
    WHERE id = 1
  `).run({
    region: cloudSideUserInfo.region,
    accessToken: cloudSideUserInfo.accessToken,
    refreshToken: cloudSideUserInfo.refreshToken,
    apikey: cloudSideUserInfo.userInfo.apikey,
    openToken: ihostSideUserInfo.openToken,
  });
}

// ========== Device ==========

export interface DeviceRow {
  thirdSerialNumber: string;
  serialNumber: string;
  mon: string;
  tues: string;
  wed: string;
  thur: string;
  fri: string;
  sat: string;
  sun: string;
}

function rowToDevice(row: Record<string, unknown>): DeviceRow {
  return {
    thirdSerialNumber: row.third_serial_number as string,
    serialNumber: row.serial_number as string,
    mon: row.mon as string,
    tues: row.tues as string,
    wed: row.wed as string,
    thur: row.thur as string,
    fri: row.fri as string,
    sat: row.sat as string,
    sun: row.sun as string,
  };
}

export function getAllDevices(): DeviceRow[] {
  const rows = db.prepare('SELECT * FROM device').all() as Record<string, unknown>[];

  return rows.map(rowToDevice);
}

export function deleteDevice(thirdSerialNumber: string): void {
  db.prepare('DELETE FROM device WHERE third_serial_number = ?').run(thirdSerialNumber);
}

export function getDevice(thirdSerialNumber: string): DeviceRow | undefined {
  const row = db.prepare('SELECT * FROM device WHERE third_serial_number = ?').get(thirdSerialNumber) as Record<string, unknown> | undefined;

  return row ? rowToDevice(row) : undefined;
}

export function upsertDevice(
  thirdSerialNumber: string,
  serialNumber: string,
  weekSchedule?: Partial<Pick<DeviceRow, (typeof WEEKLY_SCHEDULE_PARAM_KEYS)[number]>>,
): void {
  let existing = getDevice(thirdSerialNumber) as Pick<DeviceRow, (typeof WEEKLY_SCHEDULE_PARAM_KEYS)[number]>;

  if (!existing) existing = { mon: '', tues: '', wed: '', thur: '', fri: '', sat: '', sun: '' };

  const week = {
    mon: weekSchedule?.mon ?? existing.mon,
    tues: weekSchedule?.tues ?? existing.tues,
    wed: weekSchedule?.wed ?? existing.wed,
    thur: weekSchedule?.thur ?? existing.thur,
    fri: weekSchedule?.fri ?? existing.fri,
    sat: weekSchedule?.sat ?? existing.sat,
    sun: weekSchedule?.sun ?? existing.sun,
  };

  db.prepare(`
    INSERT INTO device (third_serial_number, serial_number, mon, tues, wed, thur, fri, sat, sun)
    VALUES (@thirdSerialNumber, @serialNumber, @mon, @tues, @wed, @thur, @fri, @sat, @sun)
    ON CONFLICT(third_serial_number) DO UPDATE SET
      serial_number = excluded.serial_number,
      mon  = excluded.mon,
      tues = excluded.tues,
      wed  = excluded.wed,
      thur = excluded.thur,
      fri  = excluded.fri,
      sat  = excluded.sat,
      sun  = excluded.sun
  `).run({ thirdSerialNumber, serialNumber, ...week });
}

export default db;
