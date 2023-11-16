<template>
	<view class="spinner">
		<uni-icons type="spinner-cycle" :color="color"></uni-icons>
	</view>
</template>

<script setup>
	import {
		toRefs
	} from 'vue';

	const props = defineProps({
		color: {
			type: String,
			default: '#ffffff'
		},
	});
	const {
		color
	} = toRefs(props);
</script>

<style>
	.spinner {
		width: 36rpx;
		height: 36rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		animation: rotate 1.3s linear 0.2s infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>