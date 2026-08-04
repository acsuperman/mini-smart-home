<template>
    <div class="component-item">
        <div class="Capability-container-single">
         <div class="Capability-container-left">
            <div class="Capability-icon">
                <img :src="thermostatImage">
            </div>
            <div>
                <span>当前状态</span>
            </div>
         </div>
         <div class="Capability-container-right">
            <span>{{ thermostatStatus==="HEATING"?"加热中":"保温中" }}</span>
         </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { EAdaptiveRecoveryStatus } from '@/enum'
import heatingImage from '@/assets/thermostat-status-heating.png'
import keepingImage from '@/assets/thermostat-status-keeping.png'
import { computed,inject} from 'vue';
import type { Ref } from 'vue'
import type { itemData } from '@/interface';
const device = inject<Ref<itemData>>('device')!

const thermostatStatus = computed(() => EAdaptiveRecoveryStatus[Number(device.value.params.workState)]);
const thermostatImage = computed(() => thermostatStatus.value === 'HEATING' ? heatingImage : keepingImage);
</script>

<style  scoped>
.Capability-container-single {
    width: calc(30px * 15);
    height: calc(30px * 2);
    display: flex;
    justify-content: space-between;
    align-items: center
}
</style>