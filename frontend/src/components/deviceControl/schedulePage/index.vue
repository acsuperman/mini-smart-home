<template>
    <div class="weekly-schedule">
        <div class="ws-header">
                <a-button class="btn-edit" @click="edit = true" v-if="!edit">
                    编辑
                </a-button>
                <a-button class="btn-save" type="primary" :loading="loading" @click="save" v-else>
                    保存
                </a-button>
        </div>

        <div class="week-tabs">
            <button
                v-for="(val, _key, index) in EWeekDay"
                :key="val"
                :class="['week-tab', { active: weekDay === val }]"
                @click="changeWeekDay(val)"
            >
                {{ getWeekDayName(index) }}
            </button>
        </div>

        <div class="ws-schedule">
            <a-button type="dashed" block class="btn-add" @click="addScheduleItem" :disabled="scheduleData[weekDay].length >= max || !edit">
                <template #icon><plus-circle-filled /></template>
                增加区间
            </a-button>
            <div class="ws-list">
                <WeeklyScheduleItem
                    ref="weeklyScheduleItemRef"
                    v-for="(item, index) in scheduleData[weekDay]"
                    :key="index"
                    :item="item"
                    :index="index"
                    :edit="edit"
                    :unit="unit"
                    @changeItem="changeItem"
                    @deleteItem="deleteItem"
                />
            </div>
        </div>


    </div>
</template>

<script lang="ts" setup>
import {  inject, onMounted, ref } from 'vue';
import { EWeekDay } from '@/enum';
import dayjs from 'dayjs';
import WeeklyScheduleItem from './WeeklyScheduleItem.vue';
import _ from 'lodash';
import { message } from 'ant-design-vue';
import type { WeeklyEntry } from '@/interface';
import type { itemData } from '@/interface';
import type { Ref } from 'vue';
import { getWeekDayName, paramsToWeeklySchedule, weeklyScheduleToHexParams } from '@/util/index.ts';
import { updateDevice } from '@/api/index.ts';

const device=inject<Ref<itemData>>('device')!
const weeklyScheduleItemRef = ref<{ validate: () => void }[]>();
const edit = ref(false);
const loading = ref(false);
const weekDay = ref(EWeekDay.SUNDAY);
const scheduleData = ref<Record<EWeekDay, WeeklyEntry[]>>({
    [EWeekDay.SUNDAY]: [],
    [EWeekDay.MONDAY]: [],
    [EWeekDay.TUESDAY]: [],
    [EWeekDay.WEDNESDAY]: [],
    [EWeekDay.THURSDAY]: [],
    [EWeekDay.FRIDAY]: [],
    [EWeekDay.SATURDAY]: []
});

const max = 6;
const unit = '℃'


const changeWeekDay = (day: EWeekDay) => {
    weekDay.value = day;
};

const initWeekDay = (index: number) => {
    const weekday = (function () {
        switch (index) {
            case 0: return EWeekDay.SUNDAY;
            case 1: return EWeekDay.MONDAY;
            case 2: return EWeekDay.TUESDAY;
            case 3: return EWeekDay.WEDNESDAY;
            case 4: return EWeekDay.THURSDAY;
            case 5: return EWeekDay.FRIDAY;
            case 6: return EWeekDay.SATURDAY;
            default: return EWeekDay.SUNDAY;
        }
    })();
    changeWeekDay(weekday);
};

const initScheduleData = () => {
    scheduleData.value = paramsToWeeklySchedule(device.value.params);
};

const deleteItem = (index: number) => {
    console.log("删除触发")
    scheduleData.value[weekDay.value].splice(index, 1);
};

const addScheduleItem = () => {
    scheduleData.value[weekDay.value].push({
        startTimeInMinutes: null,
        upperSetpoint: null
    });
};

const changeItem = (params: { index: number, item: WeeklyEntry }) => {
    const { index, item } = params;
    const schedule = scheduleData.value[weekDay.value][index];
    if (schedule) {
        const { upperSetpoint, startTimeInMinutes } = item;
        upperSetpoint !== undefined && (schedule.upperSetpoint = upperSetpoint);
        startTimeInMinutes !== undefined && (schedule.startTimeInMinutes = startTimeInMinutes);
    }
};

const uniq = (scheduleList: WeeklyEntry[]) => {
    const groupBy = _.groupBy(scheduleList, (item) => item.startTimeInMinutes);
    return Object.values(groupBy).map(list => list[0]);
};




const save = async () => {
    const refValidate = () => weeklyScheduleItemRef.value ? weeklyScheduleItemRef.value.every(({ validate }) => validate()) : true;
    if (!refValidate()) return;
    const data = _.cloneDeep(scheduleData.value) as (Record<EWeekDay, WeeklyEntry[]>);
    for (const weekday in data) {
        data[weekday as EWeekDay] = uniq(data[weekday as EWeekDay]);
        data[weekday as EWeekDay].sort((a, b) => a.startTimeInMinutes! - b.startTimeInMinutes!);
    }
    loading.value = true;

    
    updateDevice(device.value.deviceid,weeklyScheduleToHexParams(data)).then(res=>{
        edit.value = false;
        scheduleData.value = data;
    }).catch((error)=>{
        message.error('保存失败')
    }).finally(()=>{
        loading.value = false;
    })
};


onMounted(() => {
    const nowDay = dayjs().day();
    initWeekDay(nowDay);
    initScheduleData();
});
</script>

<style  scoped>
.weekly-schedule {
    position: relative;
}

.ws-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
    .btn-edit {
        min-width: 72px;
        border-radius: 6px;
    }
    .btn-save {
        min-width: 72px;
        border-radius: 6px;
    }
}

.week-tabs {
    display: flex;
    background: #f0f2f5;
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 20px;
}
.week-tab {
    flex: 1;
    padding: 10px 0;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #999;
    cursor: pointer;
    transition: all .2s ease;
    outline: none;
    &.active {
        background: #fff;
        color: #1890ff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
    }
    &:hover:not(.active) {
        color: #666;
    }
}

.ws-schedule {
    .btn-add {
        border-radius: 8px;
        height: 44px;
        margin-bottom: 12px;
        color: #999;
        &.ant-btn-dashed:not(:disabled):hover {
            color: #1890ff;
            border-color: #1890ff;
        }
        .anticon {
            font-size: 16px;
        }
    }
}

.ws-list {
    height: 50vh;
    overflow-y: auto;
}
</style>
