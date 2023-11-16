<template>
	<view class="stuff-list-item" @click="handleTap(data)">
		<view class="image-cover">
			<image class="image" :src="stuffIcon"></image>
		</view>
		<view class="item-content">
			<view class="name-and-address">
				<text class="name">{{ data.name }}</text>
				<view class="address-and-time">
					<text class="desc-text">{{ data.address }}</text>
					<text class="desc-text" v-if="data.time">·{{ data.time }}</text>
				</view>
			</view>
			<view class="distance">
				<text class="desc-text">{{ data.distance?.text }}</text>
				<loading v-if="!data.distance"></loading>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		toRef,
		reactive,
		defineProps,
		onMounted,
	} from 'vue';
	import loading from '@/components/loading/loading.vue';
	import {
		createBLEConnection,
		onBLEConnectionStateChange
	} from '@/common/bluetooth';
	import {
		updateLocation
	} from '@/utils/services';
    
    import stuffIcon from '@/static/logo.png';

	const props = defineProps({
		data: Object
	});

	onMounted(() => {
		createConnection();
		onConnectionStateChange();
	});

	const handleTap = (stuff) => {
		this.subNVue = uni.getSubNVueById('stuff-info');
		this.subNVue.show('slide-in-bottom');
		uni.$emit('selecte-stuff', stuff);
	}

	// 连接蓝牙
	const createConnection = () => {
		const deviceId = props.data.deviceId;
		createBLEConnection(deviceId, res => {
			console.log('蓝牙连接成功：' + deviceId);
		});
	};

	// 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
	const onConnectionStateChange = () => {
		onBLEConnectionStateChange(res => {
			console.log('蓝牙连接状态改变: ' + JSON.stringify(res));
			if (!res.connected) {
				rexportUpdateLocation(res.deviceId);
			}
		});
	};
	// 更新定位
	const rexportUpdateLocation = (deviceId) => {
		console.log('蓝牙断开上报位置: ' + deviceId);
		uni.getLocation({
			type: 'gcj02',
			geocode: true,
			isHighAccuracy: true,
			success: (res) => {
				const {
					latitude,
					longitude,
					address
				} = res;
				const updateTime = Date.now();
				updateLocation({
					deviceId,
					latitude,
					longitude,
					address,
					updateTime
				});

			},
			fail(e) {
				uni.showModal({
					title: '获取定位失败',
					content: JSON.stringify(e)
				})
			}
		})
	}
</script>

<style>
	.stuff-list-item {
		width: 750rpx;
		height: 114rpx;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	}

	.image-cover {
		width: 72rpx;
		height: 72rpx;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		border: #F2F2F4 4rpx solid;
		background-color: #fff;
		margin-left: 30rpx;
		margin-right: 20rpx;
	}

	.image {
		/* width: 52rpx;
		height: 52rpx; */
        width: 36rpx;
        height: 36rpx;
	}

	.item-content {
		flex: 1;
		height: 114rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-right: 30rpx;
		border-bottom: #C0C0BE 1rpx solid;
	}

	.desc-text {
		color: #7B7A78;
		font-size: 28rpx;
	}

	.address-and-time {
		display: flex;
		flex-direction: row;
	}

	.name {
		color: #000000;
		font-size: 36rpx;
		font-weight: bold;
	}

	.name-and-address {
		flex: 1;
	}

	.distance {
		justify-self: flex-end;
	}
</style>