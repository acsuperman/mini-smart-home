<template>
    <div class="component-item">
        <div class="Capability-container-single">
        <header class="Capability-header">
            <div class="Capability-icon">
                <img :src="image" />
            </div>
            <div>目标温度</div>
        </header>
        <div class="setpoint-wrapper">
            <a-button  shape="circle" @click="changeByStep('minus')">
                 <minus-outlined />
            </a-button>
            <div class="slider">
                <a-slider
                    :min="range[0]"
                    :max="range[1]"
                    :step="step"
                    :tipFormatter="(value: number) => `${value}${tempUnit}`"
                    :getTooltipPopupContainer="(node: HTMLElement) => node.parentNode"
                    :tooltipVisible="true"
                    tooltipPlacement="top"
                    @change="changeSetpoint"
                    v-model:value="targetSetpoint"
                />
            </div>
            <a-button shape="circle" @click="changeByStep('add')">
               <plus-outlined />
            </a-button>
        </div>
        </div>
    </div>
    
</template>

<script lang="ts" setup>
import { computed,inject } from 'vue';
import image from '@/assets/thermostat-target-setpoint.png';
import _ from 'lodash';
import type { itemData } from '@/interface';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue';

import { updateDevice } from '@/api';
import type { Ref } from 'vue'
const device = inject<Ref<itemData>>('device')!



const range = [4,35];
const step = 0.5
const tempUnit = '℃';
const targetTemName=['manTargetTemp','ecoTargetTemp','autoTargetTemp','boostRecoverTemp','timerTargetTemp'] as const


const targetSetpoint = computed(()=>{
    return Number(device.value.params[targetTemName[Number(device.value.params.workMode)]])/10
});

const changeSetpoint = _.debounce(async (value: number) => {
    updateDevice(device.value.deviceid,{manTargetTemp:value*10,workMode:'0'})
}, 250);

const changeByStep = (type: 'add' | 'minus') => {
    if (type === 'add' && targetSetpoint.value < range[1]) {
        changeSetpoint(targetSetpoint.value+step);
    }
    if (type === 'minus' && targetSetpoint.value > range[0]) {
        changeSetpoint(targetSetpoint.value-step);
    }
};
</script>

<style  scoped>


.Capability-container-single {
    width: calc(30px * 15);
    height: calc(30px * 4);
}

.setpoint-wrapper{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 45px;
    padding: 0 2px;
    .btn {
        width: 32px;
        height: 32px;
    }
    .slider {
        flex-grow: 1;
        margin: 0 8px;
    }
}
</style>
