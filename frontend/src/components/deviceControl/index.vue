<script setup lang="ts">
import { ref, defineAsyncComponent, shallowRef,toRef,provide } from 'vue';
import type { itemData } from '@/interface';
import closeIcon from '@/assets/modal-close.png'
import backIcon from '@/assets/modal-back.png'

const props = defineProps<{ device: itemData }>()
const device  = toRef(props, 'device')
const emit = defineEmits(['changeDeviceControlDialogVisible'])

const page = ref<'control'|'schedule'>('control')
const pageMap = {
    'control': {
        component:defineAsyncComponent(() => import("@/components/deviceControl/controlPage/index.vue")),
        title:device.value.name
    },
    'schedule': {
        component:defineAsyncComponent(() => import("@/components/deviceControl/schedulePage/index.vue")),
        title:'日程'
    }
}
const changePage=(newPage:'control'|'schedule')=>{
    page.value=newPage
}
provide('changePage', changePage) 
provide('device', device) 
</script>

<template>
    <div style="height: 80vh;overflow-y: auto;scrollbar-width: none;padding: 1px 1px;">
        <div id="header">
        <img class="icon" :src="closeIcon" @click="emit('changeDeviceControlDialogVisible',false)">
        <div>
            {{ pageMap[page].title }}
        </div>
        <img v-if="page!=='control'" class="icon" :src="backIcon" @click="page='control'">
        <div class="icon" v-else></div>
        </div>
        <component :is="pageMap[page].component"></component>
    </div>
    


</template>

<style scoped>
#header{
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
}
.icon{
    width: 32px;
    height: 32px;
    cursor: pointer;
}
</style>