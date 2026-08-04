export interface loginResponse {
    cloudSideConnect: boolean;
}

export interface roomListItem {
    id: string,	//N	房间 id
    name: string,	//N	房间名称
    index: number
}

export interface familyListItem {
    id: string,	//N	家庭 id
    apikey: string,	//N	用户 apikey
    name: string,	//N	家庭名称
    index: number,	//N	家庭排序号 可能存在负数
    roomList?: Array<roomListItem>	//Y	房间列表
}

export interface familyResponse {
    familyList: Array<familyListItem>,
    currentFamilyId: string
}

export interface roomDeviceList {
    [roomId: string]: itemData[]
}

export interface itemData {
    name: string,
    family: { roomid: string, familyid: string },
    extra: { uiid: number, ui: string }, //ui--- UI 的名称，uiid---UI 的 ID
    deviceid: string,
    ihostSideSerialNumber: string;
    showBrand: boolean,
    online: boolean,
    brandLogo: string,
    brandName: string,
    params: {
        workMode:string,
        workState:string,
        manTargetTemp:string,
        autoTargetTemp:string,
        ecoTargetTemp:string,
        boostRecoverTemp:string,
        timerTargetTemp:string,
        'mon': string,
        'tues': string,
        'wed': string,
        'thur': string,
        'fri': string,
        'sat': string,
        'sun': string
    }
}

export interface thingListItem {
    itemType?: number,
    index?: number,
    itemData: itemData
}

export interface familyDeviceListResponse {
    thingList: Array<thingListItem>,
    total: number
}

export interface SseOptions {
  url: string;
  params?: Record<string, string>;
}
export type MessageHandler = (event: MessageEvent) => void;

export interface WeeklyEntry {
  startTimeInMinutes: number|null;
  upperSetpoint: number|null;
}