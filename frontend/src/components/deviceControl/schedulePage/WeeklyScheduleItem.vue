<template>
    <div class="schedule-item">
        <div class="left">
            <span class="time">
                <img src="@/assets/weekly-schedule-time.png"  width="16" height="16" />
                <div class="select-container" v-if="edit && index !== 0">
                    <a-time-picker
                        class=" time-picker"
                        ref="timePickers"
                        :value="minuteToHoursStr(item.startTimeInMinutes)"
                        format="HH:mm"
                        value-format="HH:mm"
                        style="width: 92px;"
                        @change="selectPicker"
                        :getPopupContainer="(node: HTMLElement) => node.parentNode"
                    />
                </div>
                <span v-else>{{ minuteToHoursStr(item.startTimeInMinutes) }}</span>
            </span>
            <span class="temp">
                <img src="@/assets/weekly-schedule-temp.png" alt="temp" width="16" height="16" />
                <div class="select-container" v-if="edit">
                    <a-select
                        class=" temp-select "
                        ref="tempSelects"
                        :value="item.upperSetpoint"
                        style="width: 92px;"
                        @change="selectTemp"
                        :options="Array.from({ length: 63 }, (v, i) => ({ label: `${(i/2+4).toFixed(1)}℃`, value: i/2+4 }))"
                        :getPopupContainer="(node: HTMLElement) => node.parentNode"
                    />
                </div>
                <span v-else>{{ item.upperSetpoint + unit }}</span>
            </span>
        </div>
        <div class="right">
            <a-popconfirm
                overlayClassName="delete-schedule-popconfirm"
                title="确认删除日程？"
                ok-text="确认"
                cancel-text="取消"
                placement="leftBottom"
                @confirm="emit('deleteItem', index)"
                v-if="edit&&index !== 0"
            >
                <a-button type="link">
                    <img src="@/assets/delete.png" width="23" height="23">
                </a-button>
            </a-popconfirm>
        </div>
    </div>
</template>

<script lang="ts" setup>


const props = defineProps<{
    item: {
        startTimeInMinutes: number | null,
        upperSetpoint: number | null
    },
    index: number,
    edit: boolean,
    unit: string
}>();

const emit = defineEmits([ 'changeItem', 'deleteItem']);

function minuteToHoursStr(minute: number | null) {
    if (minute === null || minute === undefined || minute < 0) return null;
    const hours = `${Math.floor(minute / 60)}`;
    const leftMinute = `${minute % 60}`;
    return hours.padStart(2, '0') + ':' + leftMinute.padStart(2, '0');
}

async function selectPicker(value: string) {
    const { index } = props;
    if (value === null) {
        emit('changeItem', {
            index,
            item: { startTimeInMinutes: null }
        });
    } else {
        const arr = value.split(':');
        const hours = parseInt(arr[0]);
        const leftMinutes = parseInt(arr[1]);
        const minutes = hours * 60 + leftMinutes;
        emit('changeItem', {
            index,
            item: { startTimeInMinutes: minutes }
        });
    }
}

function selectTemp(value: number) {
    emit('changeItem', {
        index: props.index,
        item: { upperSetpoint: value }
    });
}



function validate() {
    const { startTimeInMinutes, upperSetpoint } = props.item;
    return startTimeInMinutes != undefined && upperSetpoint != undefined;
}

defineExpose({
    validate
});
</script>

<style  scoped>
.schedule-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    margin-bottom: 8px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    height: 44px;
    transition: border-color .2s;
    &:hover { border-color: #e0e0e0; }
    .left {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-around

    }
    .time, .temp {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        color: #333;
        > img {
            width: 18px;
            height: 18px;
            opacity: 0.5;
        }
    }
    .right {
        .ant-btn { padding: 0; }
    }
}


</style>
