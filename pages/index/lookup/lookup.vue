<template>
	<view class="lookup">
		<view class="radar" :class="{'radar-filled': lookupStatus === 2}" v-if="isConnected">
			<view class="radar-out"></view>
			<view class="radar-inner" :class="{'radar-inner-filled': [1,2].includes(lookupStatus)}"></view>
			<view class="radar-core" :class="{'radar-core-filled': lookupStatus === 1}"></view>
		</view>
		<view class="header">
			<text class="grap-text finding">正在查找</text>
			<loading v-if="!equipment.name"></loading>
			<text class="name">{{equipment.name}}</text>
		</view>
		<view class="center" v-if="!isConnected">
			<text>正在搜索信号...</text>
			<text>连接可能需要1分钟</text>
		</view>
		<view class="bottom">
			<view class="distance" v-if="isConnected">
				<text class="distance-message">{{distancesText[lookupStatus]}}</text>
				<text class="grap-text">{{distancesTips[lookupStatus]}}</text>
			</view>
			<view class="options">
				<view class="option" @click="closeWindow">
					<uni-icons type="closeempty" color="#fff" size="32"></uni-icons>
				</view>
				<view class="option" @click="playSound">
					<uni-icons type="sound-filled" color="#ffffff" size="32"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onUnmounted,
		computed,
	} from 'vue';
	import {
		onLoad,
		onShow,
		onHide
	} from '@dcloudio/uni-app';
	import loading from '@/components/loading/loading.vue'

	const lookupStatus = ref(0); // 距离：0：远，1：近，2：此处
	const isConnected = ref(false);
	const distancesText = reactive(['距离远', '距离近', '此处']);
	const distancesTips = reactive(['已连接，信号弱，继续走动...', '信号减弱，继续走动...', '在附近寻找你的物品...']);

	let timer; //定时器

	const characteristicId = ref('');
	const isSounded = ref(false);
	const equipment = reactive({
		name: '',
		deviceId: '',
		serviceId: '',
		characteristicId: '',
	});
	
	onLoad(() => {
		uni.$on('show-lookup', (data) => {
			equipment.name = data.name;
			equipment.deviceId = data.deviceId;
			createBLEConnection();
		});
	});

	onShow(() => {
		if (isConnected.value) {
			intervalGetBLEDeviceRSSI();
		}
	});
	
	onHide(() => {
		clearInterval(timer);
		timer = null;
	});
	
	onUnmounted(() => {
		clearInterval(timer);
		timer = null;
	});

	// 初始化蓝牙
	const openBluetoothAdapter = () => {
		uni.openBluetoothAdapter({
			success: e => {
				console.log('初始化蓝牙成功:' + e.errMsg);
				console.log(JSON.stringify(e));
				createBLEConnection();
			},
			fail: e => {
				console.log(e)
				console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));

			}
		});
	};

	// 连接蓝牙
	const createBLEConnection = () => {
		console.log('开始连接蓝牙: ', equipment.deviceId)
		uni.createBLEConnection({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: equipment.deviceId,
			success: res => {
				isConnected.value = true;
				console.log('连接蓝牙成功:' + res.errMsg);
				getBLEDeviceServices();
				intervalGetBLEDeviceRSSI();
			},
			fail: e => {
				console.log('连接低功耗蓝牙失败：' + JSON.stringify(e));
				if (e.code === -1) {
					isConnected.value = true;
					getBLEDeviceServices();
					intervalGetBLEDeviceRSSI();
					return;
				}
				if (e.code === 10012) {
					createBLEConnection();
					return;
				}
			}
		});
	};

	/**
	 * 获取所有服务
	 */
	const getBLEDeviceServices = () => {
		uni.getBLEDeviceServices({
			deviceId: equipment.deviceId,
			success: res => {
				const services = res.services;
				if (services.length <= 0) {
					getBLEDeviceServices();
					return;
				}
				equipment.serviceId = services[2].uuid;
				// 获取写服务的特征值
				getBLEDeviceCharacteristics({
					deviceId: equipment.deviceId,
					serviceId: equipment.serviceId,
				});
			},
			fail: e => {
				console.log('获取设备服务失败，错误码：' + e.errCode);
			}
		});
	};
	/**
	 * 获取某个服务下的所有特征值
	 */
	const getBLEDeviceCharacteristics = (equipment) => {
		const { deviceId, serviceId } = equipment;
		uni.getBLEDeviceCharacteristics({
			deviceId,
			serviceId,
			success: res => {
				console.log('getBLEDeviceCharacteristics', JSON.stringify( res.characteristics))
				const _ctsc = res.characteristics.find(item => !!item.properties.write);
				if (!_ctsc) return;
				characteristicId.value = _ctsc.uuid;
				equipment.characteristicId = _ctsc.uuid;
			},
			fail: e => {
				console.log('获取特征值失败，错误码：' + e.code);
			}
		});
	};


	// 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
	const onBLEConnectionStateChange = () => {
		uni.onBLEConnectionStateChange(res => {
			if (!res.connected) {
				clearInterval(timer);
			}
		});
	};


	/**
	 * 写入低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持 write 才可以成功调用
	 */
	const writeBLECharacteristicValue = () => {
		// 向蓝牙设备发送一个0x00的16进制数据
		const buffer = new ArrayBuffer(1);
		const dataView = new DataView(buffer);
		dataView.setUint8(0, isSounded.value ? 0 : 1);
		console.log('响铃：'+JSON.stringify(equipment));
		uni.writeBLECharacteristicValue({
			deviceId: equipment.deviceId,
			serviceId:  equipment.serviceId,
			characteristicId: equipment.characteristicId || characteristicId.value,
			// 这里的value是ArrayBuffer类型
			value: buffer,
			success: (res) => {
				isSounded.value = !isSounded.value;
			},
			fail(err) {
				console.log('writeBLECharacteristicValue error', err)
			}
		})

	};
	
	// 响铃
	const playSound = () => {
		if (!isConnected) return;
		writeBLECharacteristicValue();
	};

	// 定时获取蓝牙信号强度
	const intervalGetBLEDeviceRSSI = () => {
		if (timer) return;
		timer = setInterval(() => {
			uni.getBLEDeviceRSSI({
				deviceId: equipment.deviceId,
				success: (res) => {
					const {
						RSSI
					} = res;
					touchFeedback();
					if (RSSI > -60) {
						lookupStatus.value = 2;
					} else if (RSSI > -70) {
						lookupStatus.value = 1;
					} else {
						lookupStatus.value = 0;
					}
				},
				fail: (err) => {
					console.log(JSON.stringify(err), '<======Error getBLEDeviceRSSI');
					if (err.code === 10004) {
						isConnected.value = false;
					}
				}
			});
		}, 1000);
	};

	// 关闭当前页面
	const closeWindow = () => {
		uni.navigateBack();
		clearInterval(timer);
		timer = null;
	};

	// 触感反馈
	const touchFeedback = () => {
		// #ifdef APP-PLUS
		const platform = uni.getSystemInfoSync().platform;
		if (platform === 'ios') {
			let UIImpactFeedbackGenerator = plus.ios.importClass(
				'UIImpactFeedbackGenerator'
			);
			let impact = new UIImpactFeedbackGenerator();
			impact.prepare();
			impact.init(1);
			impact.impactOccurred();
		} else if (platform === 'android') {
			uni.vibrateShort();
		}
		// #endif
	};
</script>

<style>
	.lookup {
		position: relative;
		width: 750rpx;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		color: #ffffff;
		background-color: #000000;
		overflow: hidden;
	}

	.radar {
		position: absolute;
		top: 0;
		bottom: 0;
		z-index: 0;
		width: 100vh;
		height: 100vh;
		transition: background-color 300ms ease;
	}

	.radar-out {
		position: absolute;
		top: 0;
		bottom: 0;
		z-index: 0;
		width: 100vh;
		height: 100vh;
		border-radius: 50%;
		border: #727272 14rpx solid;
	}

	.radar-filled {
		background-color: #3A83F6;
	}

	.radar-filled>.radar-out {
		border: none;
	}

	.radar-inner {
		width: 800rpx;
		height: 800rpx;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		border: #727272 14rpx solid;
	}

	.radar-inner-filled {
		background-color: #3A83F6;
		border: none;
	}

	.radar-core {
		width: 60rpx;
		height: 60rpx;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background-color: #ffffff;
		transition: all 300ms ease;
	}

	.radar-core-filled {
		width: 210rpx;
		height: 210rpx;
	}

	.radar-filled>.radar-core {
		width: 360rpx;
		height: 360rpx;
	}

	.header {
		width: 750rpx;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
		padding: 0 35rpx;
		margin-top: 168rpx;
		box-sizing: border-box;
	}

	.name {
		font-size: 60rpx;
		font-weight: bold;
	}

	.grap-text {
		color: #eeeeee;
	}

	.center {
		width: 380rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 42rpx;
		font-weight: 500;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
	}

	.distance {
		display: flex;
		flex-direction: column;
		padding-left: 35rpx;
		margin-bottom: 50rpx;
	}

	.distance-message {
		font-size: 80rpx;
		font-weight: bold;
	}

	.options {
		width: 750rpx;
		display: flex;
		justify-content: space-between;
		padding: 0 70rpx;
		box-sizing: border-box;
		margin-bottom: 59rpx;
	}

	.option {
		width: 128rpx;
		height: 128rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		backdrop-filter: blur(20rpx);
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.3);
	}
</style>