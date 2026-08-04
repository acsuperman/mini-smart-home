<script setup lang="ts">
import type { itemData } from "@/interface";
import { computed, toRef } from "vue";
import { storeToRefs } from 'pinia'
import logo from "@/assets/logo.png"
import { useUserStore } from "@/store/user";
import { getOpenToken, integrateDevice,disIntegrateDevice } from "@/api";
import { ElMessage } from 'element-plus';
import { getThermostatChineseName } from "@/util";
const userStore = useUserStore()
const {ihostSideConnect}=storeToRefs(userStore)
const props = defineProps<{ device: itemData }>()
const emit=defineEmits(['changeIhostAuthDialogVisble'])
const device  = toRef(props, 'device')
const isTarget = computed(() => device.value?.extra?.uiid === 7017) //uuid判定
const isOnline = computed(() => device.value?.online)
const workModeBackground = computed(() => device.value?.ihostSideSerialNumber ? 'rgba(176, 247, 168, 0.5)' : 'rgba(246, 246, 140, 0.5)')
const onSyncButtonClick=()=>{
    if(!ihostSideConnect.value){
        emit("changeIhostAuthDialogVisble",true)
        getOpenToken()
    }
    else{
        integrateDevice(device.value).then(()=>{
            ElMessage.success("同步成功")
        }).catch((error)=>{
            ElMessage.error(error.message || "同步失败，请稍后再试")
        })
    }
}

const onDisSyncButtonClick=()=>{
    if(!ihostSideConnect.value){
        emit("changeIhostAuthDialogVisble",true)
        getOpenToken()
    }
    else{
        disIntegrateDevice(device.value).then(()=>{
            ElMessage.success("取消同步成功")
        }).catch((error)=>{
            ElMessage.error(error.message || "取消同步失败，请稍后再试")
        })
    }
}

</script>

<template>
    <div id="device-card"
        :class="(isTarget && isOnline) ? 'controllable' : 'disabled-device-card'">
        <div style="display:flex;justify-content:space-between">
            <div v-if="isTarget" @click.stop>
                <div id="sync-tip" v-if="device.ihostSideSerialNumber" @click="onDisSyncButtonClick"><el-icon><CloseBold /></el-icon>终止同步</div>
                <div id="un-sync-tip" @click="onSyncButtonClick" v-else><el-icon><Refresh /></el-icon>同步</div>
            </div>
            <div v-else></div>
            <img :src="device.showBrand ? device.brandLogo : logo" alt="brand logo"
                style="max-width:50px;max-height: 30px; margin: 8px;">
        </div>


        <div
            style="display: flex;width: 100%; height: 52px; font-size-adjust: auto;font-stretch: ultra-condensed; color: #666;font-weight: bold;margin-top: 40px; margin-left: 16px">
            {{ device.name + (!isOnline ? "(离线)" : "") }}
        </div>
        <div v-if="isTarget && isOnline" :style="{ width: '100%', fontSize: '13px', textAlign: 'center', backgroundColor: workModeBackground, position: 'relative' }">
           {{getThermostatChineseName( Number(device.params.workMode)) }}
        </div>
        <div v-else-if="!isTarget" text-align:center style="color: #999; font-size: 14px;">
            设备正在接入中，敬请期待~
        </div>

    </div>
</template>

<style scoped>
#device-card {
    border-radius: 16px;
    background-color: rgb(255, 255, 255);
    box-shadow: 1px 1px 0.4px grey;
    position: relative;
    transition: transform 0.3s ease;
    width:176px;
    height:176px;
    cursor:pointer;
}

#device-card.controllable:hover {
    transform: rotate(3deg);
}

#device-card.disabled-device-card {
    background-color: rgb(197 198 200);
}

#sync-tip{
    width: 100px;
    height: 40px;
    border-top-left-radius: 16px;
    border-bottom-right-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(177, 244, 167, 0.5)
}

#un-sync-tip{
    width: 60px;
    height: 40px;
    border-top-left-radius: 16px;
    border-bottom-right-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(246, 246, 140, 0.5)
}
</style>