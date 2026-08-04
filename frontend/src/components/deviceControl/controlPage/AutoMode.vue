<template>
    <div class="component-item">
        <div class="Capability-container-single">
         <div class="Capability-container-left">
            <div class="Capability-icon">
                <img :src="image">
            </div>
            <div>
                <span>日程</span>
                <span class="tip">(仅在自动模式下生效)</span>
            </div>
        </div>
        <div class="Capability-container-right">
            <RightOutlined class="arrow-icon" @click="()=>changePage('schedule')"/>
        </div>
       </div>
    </div>
    
</template>

<script lang="ts" setup>

import image from '@/assets/thermostat-weekly-schedule.png';
import { RightOutlined } from '@ant-design/icons-vue';
import { inject } from 'vue';
const changePage=inject<(pageName:string)=>void>('changePage')!
</script>

<style  scoped>
.Capability-container-single {
    width: calc(30px * 15);
    height: calc(30px * 2);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.tip{
    color: #A1A1A1;
    font-size: 14px;
}
</style>
