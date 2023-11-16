<template>
	<view class="picker">
		<block v-for="item in items" :key="item">
			<view class="picker-item" :class="{'picker-item-active': item === selectName }" @click="onSelect(item)">
				<text class="picker-item-text">{{item}}</text>
			</view>
		</block>
	</view>
	<view class="input-cover">
		<uni-easyinput v-model="name" :disabled="disabled" :inputBorder="false" @change="onChange" @focus="onFocus" @blur="onBlur" class="name-input"></uni-easyinput>
	</view>
	<view class="footer-buttons">
		<view class="button">
			<text class="button-text" @click="cancel">取消</text>
		</view>
		<view class="button">
			<text class="button-text" @click="confirm">确定</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, defineProps, defineEmits, watchEffect } from 'vue'
	
	const { value } = defineProps({
		value: String
	});
	const emits = defineEmits(['confirm', 'cancel', 'focus', 'blur']);
	
	const name = ref('钱包');
	const selectName = ref('钱包');
	const disabled = ref(true);
	const items = reactive(['钱包', '充电宝', '背包', '自行车', '伞', '自定义命名'])
	
	watchEffect(() => {
		if (!value) return;
		selectName.value = value;
		name.value = value;
	});
	
	const onSelect = (value) => {
		selectName.value = value;
		name.value = value;
		disabled.value = value !== '自定义命名';
	}

	const onChange = (value) => {
		name.value = value;
	}
	
	const confirm = () => {
		emits('confirm', name.value);
	}
	
	const cancel = () => {
		emits('cancel');
	}
	
	const onFocus = () => {
		emits('focus')
	}
	
	const onBlur = () => {
		emits('blur')
	}
</script>

<style scoped>
	.picker {
		width: 640rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.picker-item {
		width: 188rpx;
		height: 72rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 72rpx;
		background-color: #f3f3f3;
		margin-top: 30rpx;
	}
	.picker-item-text {
		font-size: 28rpx;
	}
	.picker-item-active {
		background-color: #f0f8ff;
	}
	.input-cover {
		display: flex;
		width: 728rpx;
		height: 98rpx;
		justify-content: center;
		align-items: center;
		margin-top: 80rpx;
	}
	.name-input {
		width: 680rpx;
		height: 98rpx;
		font-size: 28rpx;
		border-bottom: #ddd 1rpx solid;
	}
	
	.footer-buttons {
		width: 460rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin-top: 40rpx;
	}
	.button {
		width: 166rpx;
		height: 88rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.button-text {
		color: #307AFD;
		font-size: 32rpx;
	}
</style>