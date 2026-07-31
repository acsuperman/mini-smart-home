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
        switches: Array<{ outlet: number, switch: "on" | "off" }>,
        online: boolean
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