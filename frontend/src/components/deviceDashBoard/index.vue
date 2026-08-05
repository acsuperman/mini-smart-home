<script setup lang="ts">
import { useUserStore } from "@/store/user";
import { storeToRefs } from 'pinia'
import { watch, ref, nextTick, onMounted } from "vue";
import DeviceCard from "@/components/deviceDashBoard/deviceCard.vue";
import type { itemData } from "@/interface";
import DeviceControl from "@/components/deviceControl/index.vue";
import IhostAuth from "./ihostAuth.vue";
import { cloneDeep } from "lodash";
import { useSse } from "@/common/sse";



const userStore = useUserStore()
const { currentChooseInfo, roomDeviceList } = storeToRefs(userStore)
const roomList = ref<Array<{
    id: string;
    name: string;
    index: number
}>>([])

const nowChooseDevice = ref<itemData | null>(null)
const deviceControlDialogVisible = ref(false)
const ihostAuthDialogVisble=ref(false)


const onDeviceCardClick = (device: itemData) => {
    if (device.extra.uiid !== 7017 || device.online === false)
        return;
    nowChooseDevice.value = device
    deviceControlDialogVisible.value = true
}

const changeIhostAuthDialogVisble=(visible:boolean)=>{
    ihostAuthDialogVisble.value=visible
}
const changeDeviceControlDialogVisible=(visible:boolean)=>{
    deviceControlDialogVisible.value=visible
}



watch(currentChooseInfo, async (newVal, oldVal) => {
    if (newVal.familyId && newVal.familyId !== oldVal.familyId) {
        const familyId = newVal.familyId
        roomList.value = [{ id: "-1", name: "未分配", index: -1 }, ...(cloneDeep(userStore.familyInfo.familyList.find(family => family.id === newVal.familyId))?.roomList || [])]
        roomList.value.forEach((item) => item.id = familyId + "+" + item.id)
    }
    await nextTick()
    if (newVal.roomName) {
        const elements = document.querySelectorAll('.room-name')
        for (const el of elements) {
            if (el.textContent?.trim() === newVal.roomName) {
                el.scrollIntoView({ behavior: "smooth", block: "start" })
                break
            }
        }
    } else {
        document.getElementById('family-name')?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
}, {})

onMounted(() => {
    const sseClient=useSse({
        url: '/api/sse/bridge',
    })
    sseClient.connect()
    sseClient.sseAddEventListener('connectStatusChange', (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if(data.cloudSideConnect==false){
            userStore.logout()
        }
        else{
            userStore.cloudSideConnect=data.cloudSideConnect
            userStore.ihostSideConnect=data.ihostSideConnect
        }
    })
    sseClient.sseAddEventListener('deviceStatusChange', (event: MessageEvent) => {
        const data = JSON.parse(event.data) as {
            deviceid: string;
            params: Record<string, any>;
        }
        const targetDevice=Object.values(roomDeviceList.value).flat().find(device=>device.deviceid===data.deviceid)
        if(!targetDevice){
            return
        }
        if(data.params.online!==undefined){
            targetDevice.online=data.params.online
            delete data.params.online
        }
        if(data.params.ihostSideSerialNumber!==undefined){
            targetDevice.ihostSideSerialNumber=data.params.ihostSideSerialNumber
            delete data.params.ihostSideSerialNumber
        }
        Object.assign(targetDevice.params, data.params)
    })
})





</script>

<template>
    <div id="family-name">{{ currentChooseInfo.familyName }}</div>

    <div v-for="(room) in roomList" :key="room.id">
        <div class="room-name">{{ room.name }}</div>
        <div v-if="roomDeviceList[room.id]?.length === undefined || roomDeviceList[room.id].length === 0">
            <el-empty description="无设备" />
        </div>
        <div v-else style="display: flex; flex-wrap: wrap; gap: 16px; margin-left: 16px">
            <div v-for="(device) in roomDeviceList[room.id]" :key="device.deviceid" @click="onDeviceCardClick(device)">
                <DeviceCard :device="device" @changeIhostAuthDialogVisble="changeIhostAuthDialogVisble"/>
            </div>
        </div>
    </div>
    <a-modal v-model:visible="deviceControlDialogVisible" width="520px" centered :closable="false" :footer="null" destroy-on-close>
        <DeviceControl :device="nowChooseDevice!" @changeDeviceControlDialogVisible="changeDeviceControlDialogVisible"/>
    </a-modal>
    <a-modal v-model:visible="ihostAuthDialogVisble" width="520px" centered :closable="false" :footer="null">
        <IhostAuth @changeIhostAuthDialogVisble="changeIhostAuthDialogVisble"></IhostAuth>
    </a-modal>

</template>

<style scoped>
:global(.ant-modal-content) {
    border-radius: 16px;
}

#family-name {
    font-size: 40px;
    font-weight: bold;
    margin: 16px 0px 16px 16px;
}

.room-name {
    font-size: 20px;
    font-weight: bold;
    margin: 16px;
}
</style>
