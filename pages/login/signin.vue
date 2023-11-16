<template>
	<view class="sign">
		<uni-forms class="sign-form" :modelValue="formData" label-align="center">
			<uni-forms-item label="账号" name="account">
				<uni-easyinput type="text" :inputBorder="false" v-model="formData.account" placeholder="请输入手机号/邮箱"
					@input="onAccountChange" />
			</uni-forms-item>
			<uni-forms-item label="密码" name="password">
				<uni-easyinput type="password" :inputBorder="false" v-model="formData.password" placeholder="请输入密码"
					@input="onPasswordChange" />
			</uni-forms-item>
			<view @click="gotoSignUp">
				<text class="sign-up-button">注册新用户</text>
			</view>
		</uni-forms>
		<view class="sign-submit">
			<button type="primary" class="sign-submit-button"
				@click="submitForm">登录</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'
	import { userLogin, getLoginUser } from '@/utils/services';
	const disabled = ref(true);
	const formData = reactive({});

	const onAccountChange = (value) => {
		const {
			account = '', password = ''
		} = formData;
		if (account.length > 0 && password.length > 0) {
			disabled.value = true;
		} else {
			disabled.value = false;
		}
	}

	const onPasswordChange = (value) => {
		const {
			account = '', password = ''
		} = formData;
		if (account.length > 0 && password.length > 0) {
			disabled.value = true;
		} else {
			disabled.value = false;
		}
	}

	const submitForm =async () => {
		const res = await userLogin(formData);
        console.log('login res: '+JSON.stringify(res));
		if (res.success) {
			uni.setStorageSync('SUPER-TAG-UserInfo', res.data);
			uni.setStorageSync('User-Access-Token', res.data.accessToken);
			uni.switchTab({
				url: '/pages/index/index',
                fail() {
                    uni.redirectTo({
                    	url: '/pages/index/index'
                    });
                }
			});
		}
	}
	
	const gotoSignUp = () => {
		uni.navigateTo({
			url: '/pages/login/signup'
		})
	}
</script>

<style>
	.sign {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		height: 100vh;
		padding-top: 100rpx;
		box-sizing: border-box;

	}
	
	.sign-form {
		width: 620rpx;
	}
	
	.uni-forms-item {
		border-bottom: 1rpx #333 solid;
	}
	
	.sign-submit {
		margin-top: 180rpx;
	}

	.sign-submit-button {
		width: 520rpx;
		height: 98rpx;
		border-radius: 98rpx;
	}

	.sign-up-button {
		color: #3A83F6;
		margin-left: 60rpx;
	}
</style>