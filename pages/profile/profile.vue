<!-- 个人中心 -->
<template>
    <view class="profile">
        <view class="profile-header">
            <view class="header-info">
                <view class="header-avatar">
                    <image class="img" src="../../static/defaultAvatar.png"></image>
                </view>
                <view class="header-account">
                    <text class="username">{{ userInfo.username }}</text>
                    <text class="account">{{ userInfo.account }}</text>
                </view>
            </view>
        </view>
        <view class="account-detail-title">
            <text class="text">账号详情</text>
        </view>
        <view class="option-list">
            <block v-for="item in options" :key="item.value">
                <view class="option-item">
                    <text class="options-item-title">{{item.lable}}</text>
                    <uni-icons type="right" size="16" color="#97A1AB"></uni-icons>
                </view>
            </block>
        </view>
        <view class="footer">
            <view class="log-out" @click="handleLogout">
                <text class="text">登出</text>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { reactive } from 'vue';
    import { onLoad } from '@dcloudio/uni-app'
    
    const options = reactive([
        {lable: '修改账号信息', value: 1},
        {lable: '修改密码', value: 2},
        {lable: '绑定手机号', value: 3},
        {lable: '绑定邮箱', value: 4},
        {lable: '我的设备', value: 5},
    ]);
    const userInfo = reactive({
        id: '',
        account: '',
        username: '',
    });
    
    onLoad(() => {
       const _user = uni.getStorageSync('SUPER-TAG-UserInfo');
       userInfo.id = _user.id;
       userInfo.account = _user.account;
       userInfo.username = _user.username;
       console.log('Profile Get UserInfo: '+JSON.stringify(userInfo));
    });
    
    // 登出
    const handleLogout = () => {
        uni.showModal({
            title: '登出提醒',
            content: '确定要退出当前账号吗?',
            success: ({ confirm, cancel }) => {
                if (confirm) {
                    uni.removeStorageSync('SUPER-TAG-UserInfo');
                    uni.removeStorageSync('User-Access-Token');
                    uni.redirectTo({
                        url: '/pages/login/signin'
                    })
                }
            }
        });
    }
</script>

<style lang="scss" scoped>
.profile {
    flex: 1;
    width: 100vw;
    height: 100vh;
    background-color: #F2F4F8;
    
    .profile-header {
        width: 100vw;
        height: 430rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        background-color: #15181B;
    }
    .header-info {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding-left: 45rpx;
    }
    .header-avatar {
        width: 156rpx;
        height: 156rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 156rpx;
        border: #5BB0A3 solid 4rpx;
        overflow: hidden;
        .img {
            width: 166rpx;
            height: 166rpx;
        }
    }
    .header-account {
        display: flex;
        flex-direction: column;
        padding-left: 25rpx;
        .username {
            color: #fff;
            font-size: 42rpx;
            font-weight: bold;
        }
        .account {
            color: #483AE6;
            margin-top: 8rpx;
        }
    }
    
    .account-detail-title {
        width: 100vw;
        height: 94rpx;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 30rpx;
        box-sizing: border-box;
        .text {
            color: #15181B;
            font-size: 28;
            font-weight: 500;
        }
    }
    .option-list {
        flex: 1;
        background-color: red;
    }
    .option-item {
        width: 100vw;
        height: 98rpx;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 30rpx;
        box-sizing: border-box;
        background-color: #fff;
        border-bottom: #E3EDF8 solid 2rpx;
    }
    .option-item-title {
        color: #15181B;
        font-size: 28rpx;
        font-weight: 500;
    }
    .footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 40rpx;
    }
    .log-out {
        width: 255rpx;
        height: 98rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 98rpx;
        background-color: #fff;
        box-shadow: 0px 2px 10rpx 4rpx rgba(0, 0, 0, 0.1);
        .text {
            font-size: 38rpx;
            font-weight: bold;
        }
    }
}
</style>
