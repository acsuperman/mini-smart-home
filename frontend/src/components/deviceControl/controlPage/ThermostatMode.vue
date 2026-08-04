<template>
    <div class="component-item">
        <div class="Capability-container-single">
         <header class="Capability-header">
            <div class="Capability-icon">
                <img :src="image">
            </div>
            <div>温控模式</div>
         </header>
        <div class="wrapper">
            <div class="mode-item" v-for="({ name, data }) in thermostatModeOptions" :key="name">
                <div  @click="setThermostatMode(name)">
                    <img v-if="name === mode" :src="data.activeImage" width="46" height="46" />
                    <img v-else :src="data.image" width="46" height="46" />
                </div>
                <div class="text">{{ data.text }}</div>
            </div>

        </div>
    </div>
    </div>

   
</template>

<script lang="ts" setup>
import { computed, ref,inject } from 'vue';
import image from '@/assets/thermostat-icon.png';
import ecoImage from '@/assets/thermostatic-mode-1.png'
import ecoImageActive from '@/assets/thermostatic-mode-1-active.png'
import manualImage from '@/assets/thermostatic-mode-2.png'
import manualImageActive from '@/assets/thermostatic-mode-2-active.png'
import autoImage from '@/assets/thermostatic-mode-3.png'
import autoImageActive from '@/assets/thermostatic-mode-3-active.png'
import { EThermostatWorkMode } from '@/enum';
import type { itemData } from '@/interface';
import { updateDevice } from '@/api';

import type { Ref } from 'vue'
const device = inject<Ref<itemData>>('device')!


const mode = computed(() => Number(device.value.params.workMode));
const { MANUAL, AUTO, ECO } = EThermostatWorkMode;


const thermostatModeOptions = ref<Array<{ name: EThermostatWorkMode, data: { image: string, activeImage: string, text: string } }>>([
    { name: ECO, data: {
        image: ecoImage,
        activeImage: ecoImageActive,
        text: '关闭(防霜冻)',
    } },
    { name: MANUAL, data: {
        image: manualImage,
        activeImage: manualImageActive,
        text: '手动模式',
    } },
    { name: AUTO, data: {
        image: autoImage,
        activeImage: autoImageActive,
        text: '自动模式',
    } }
]);
const setThermostatMode=(workMode:number)=>{
    updateDevice(device.value.deviceid,{workMode:workMode.toString()})
}
</script>

<style scoped>
.Capability-container-single {
    width: calc(30px * 16);
    height: calc(30px * 4);
}

.wrapper{
    display:flex;
    justify-content: space-around;
    align-items: center;
}
.mode-item{
    flex:1;
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img{
        cursor:pointer
    }
}
</style>