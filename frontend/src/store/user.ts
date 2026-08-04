import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { userLogin, getFamilyDeviceList, shutoffCloudSideConnect } from "@/api";
import router from "@/router";
import { ElLoading } from 'element-plus'
import type {  familyResponse, familyDeviceListResponse,roomDeviceList } from "@/interface";




export const useUserStore = defineStore("user", () => {
    const familyInfo = ref<familyResponse>({
        familyList: [],
        currentFamilyId: ""
    })
    const currentChooseInfo = ref<{
        familyId: string,
        familyName: string,
        roomId?: string,
        roomName?: string
    }>({
        familyId: "",
        familyName: "",
    });
    const cloudSideConnect=ref<boolean>(false)
    const ihostSideConnect=ref<boolean>(false)

    const roomDeviceList = ref<roomDeviceList>({})
    const login = async (account: string, password: string, countryCode: string) => {
        try{
            await userLogin(account, password, countryCode)
            cloudSideConnect.value=true
        }catch(error){
            cloudSideConnect.value=false
        }

    };

    const logout = () => {
        shutoffCloudSideConnect()
        cloudSideConnect.value=false
        ihostSideConnect.value=false
        familyInfo.value = {
            familyList: [],
            currentFamilyId: ""
        };
        currentChooseInfo.value = {
            familyId: "",
            familyName: "",
        };
        router.push("/login");
    };
    watch(familyInfo, (newVal) => {
        if (newVal.familyList?.length == 0)
            return;
        const temRoomDeviceList: roomDeviceList = {}
        const promiseArray: Array<Promise<familyDeviceListResponse>> = []
        const loading = ElLoading.service({
            lock: true,
            text: 'Loading',
            background: 'rgba(0, 0, 0, 0.7)',
        })
        newVal.familyList.forEach((family) => {
            promiseArray.push(getFamilyDeviceList(family.id))
        })
        Promise.allSettled(promiseArray).then(results => {
            results.forEach(result => {
                if (result.status === "fulfilled") {
                    result.value.thingList.forEach((thing) => {
                        const itemData = thing.itemData
                        const roomId = itemData.family.roomid || "-1"// -1是未分配
                        const familyId = itemData.family.familyid
                        const mixedId = familyId + "+" + roomId
                        if (!temRoomDeviceList[mixedId]) {
                            temRoomDeviceList[mixedId] = []
                        }
                        temRoomDeviceList[mixedId].push(itemData)
                    })
                }
            })
            roomDeviceList.value = temRoomDeviceList
            loading.close()
        })
    });

    return {cloudSideConnect, ihostSideConnect, familyInfo, currentChooseInfo, login, logout, roomDeviceList };
}, {
    persist: {
        pick: [ 'cloudSideConnect','ihostSideConnect', 'familyInfo'],
    },
});