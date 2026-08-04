<script setup lang="ts">
import { getOpenToken } from '@/api';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import {ref} from 'vue';
const userStore = useUserStore()
const {ihostSideConnect}=storeToRefs(userStore)
const confirmBtLoading=ref(false)
const emit=defineEmits(['changeIhostAuthDialogVisble'])
const onConfirm=()=>{
    confirmBtLoading.value = true;
    getOpenToken().then(res=>{
        ihostSideConnect.value=true;
        emit('changeIhostAuthDialogVisble',false)
    }).catch(error=>{
        ElMessage.error(error.message || '获取网关接口调用凭证失败，请稍后再试')
    }).finally(()=>{
        confirmBtLoading.value = false;
    })
}

</script>

<template>
    <div id="header" >
        获取网关接口调用凭证        
    </div>
    <div id="content">
        您正在尝试用网关接口，请确认允许获取接口调用权限
    </div>
    <div id="button-group">
        <el-button @click="emit('changeIhostAuthDialogVisble', false)">取消</el-button>
        <el-button type="primary" @click="onConfirm" :loading="confirmBtLoading">确认</el-button>
    </div>
</template>

<style scoped>
#header {
    width: 504px;
    text-align: center; 
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 40px;
}
#content{
    text-align: center; 
    font-size: 15px;
    margin-bottom: 40px;
}
#button-group{
    display: flex;
    justify-content: center;

}
</style>
