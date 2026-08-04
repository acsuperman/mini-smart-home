<script setup lang="ts">
import thermostatImage from "@/assets/thermostat.png"
import ThermostatMode from '@/components/deviceControl/controlPage/ThermostatMode.vue';
import AdaptiveRecoveryStatus from '@/components/deviceControl/controlPage/AdaptiveRecoveryStatus.vue';
import ManualMode from '@/components/deviceControl/controlPage/ManualMode.vue';
import AutoMode from '@/components/deviceControl/controlPage/AutoMode.vue';


</script>

<template>
    <div>
        <div id="imageArea">
            <img :src="thermostatImage" alt="">
        </div>
        <ThermostatMode ></ThermostatMode>
        <AdaptiveRecoveryStatus ></AdaptiveRecoveryStatus>
        <ManualMode ></ManualMode>
        <AutoMode ></AutoMode>
        
    </div>
</template>

<style scoped>

#imageArea{
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}
</style>