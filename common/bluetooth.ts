// 初始化蓝牙
export const openBluetoothAdapter = (callback ?: Function) => {
	uni.openBluetoothAdapter({
		success: e => {
			callback?.(e);
		},
		fail: e => {
			console.log('初始化蓝牙失败，错误码：' + (e.code || e.errMsg));

		}
	});
};

/**
 * 开始搜索蓝牙设备
 */
export const startBluetoothDevicesDiscovery = (callback ?: Function) => {
	uni.startBluetoothDevicesDiscovery({
		success: () => {
			onBluetoothDeviceFound((res) => {
				callback?.(res)
			});
		},
		fail: e => {
			console.log('搜索蓝牙设备失败，错误码：' + e.errCode);
		}
	});
};

/**
 * 停止搜索蓝牙设备
 */
export const stopBluetoothDevicesDiscovery = () => {
	uni.stopBluetoothDevicesDiscovery({
		success: e => {
			console.log('停止搜索蓝牙设备成功')
		},
		fail: e => {
			console.log('停止搜索蓝牙设备失败，错误码：' + JSON.stringify(e));
		}
	});
};

/**
 * 发现外围设备
 */
export const onBluetoothDeviceFound = (callback ?: Function) => {
	uni.onBluetoothDeviceFound(() => {
		getBluetoothDevices((res: any) => {
			callback?.(res);
		});
	});
};

/**
 * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
 */
export const getBluetoothDevices = (callback ?: Function) => {
	uni.getBluetoothDevices({
		success: res => {
			callback?.(res.devices);
		},
		fail: e => {
			console.log('获取蓝牙设备错误，错误码：' + e.errCode);
		}
	});
}

/**
 * 获取本机蓝牙适配器状态
 */
export const getBluetoothAdapterState = (callback ?: Function) => {
	uni.getBluetoothAdapterState({
		success: res => {
			callback?.(res);
		},
		fail: e => {
			console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode);
		}
	});
}


// 缓存重连次数 key=deviceId
const ReConnectCount = {}
// 连接蓝牙
export const createBLEConnection = (deviceId : string, callback ?: Function) => {
	console.log('开始连接蓝牙 deviceId: ' + deviceId);
		
	if (!ReConnectCount[deviceId]) {
		ReConnectCount[deviceId] = 10;
	}
	
	uni.createBLEConnection({
		deviceId,
		success: res => {
			ReConnectCount[deviceId] = undefined;
			callback?.(res);
		},
		fail: e => {
			console.log('连接低功耗蓝牙失败：' + JSON.stringify(e));
			if (e.code === -1) {
				callback?.(e);
				return;
			}
			if (e.code === 10012) {
				ReConnectCount[deviceId]--;
				console.log('ReConnectCount: '+JSON.stringify(ReConnectCount))
				if (ReConnectCount[deviceId] <= 0) return;
				createBLEConnection(deviceId, callback);
				return;
			}
		}
	});
};

/**
 * 获取所有服务
 */
export const getBLEDeviceServices = (deviceId : string, callback ?: Function) => {
	uni.getBLEDeviceServices({
		deviceId,
		success: res => {
			const services = res.services;
			if (services.length <= 0) {
				getBLEDeviceServices(deviceId, callback);
				return;
			}
			callback?.(services);
		},
		fail: e => {
			console.log('获取设备服务失败，错误码：' + e.code);
		}
	});
};


/**
 * 获取某个服务下的所有特征值
 */
type GetBLECharacteristicsParams = {
	deviceId : string;
	serviceId : string;
}
export const getBLEDeviceCharacteristics = (equipment : GetBLECharacteristicsParams, callback ?: Function) => {
	const { deviceId, serviceId } = equipment;
	uni.getBLEDeviceCharacteristics({
		deviceId,
		serviceId,
		success: res => {
			callback?.(res.characteristics);
		},
		fail: e => {
			console.log('获取特征值失败，错误码：' + e.code);
		}
	});
};


// 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
export const onBLEConnectionStateChange = (callback ?: Function) => {
	uni.onBLEConnectionStateChange(res => {
		callback?.(res);
	});
};


/**
 * 写入低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持 write 才可以成功调用
 */
type WriteBLEValue = {
	deviceId : string;
	serviceId : string;
	characteristicId : string;
	buffer : ArrayBuffer | any;
}
export const writeBLECharacteristicValue = (equipment : WriteBLEValue, callback ?: Function) => {
	const { deviceId, serviceId, characteristicId, buffer } = equipment;
	return uni.writeBLECharacteristicValue({
		deviceId,
		serviceId,
		characteristicId,
		value: buffer,
		success: () => {
			console.log('成功写入特征值：' + buffer);
			callback?.();
		},
		fail(err) {
			console.log('写入特征值错误：' + JSON.stringify(err));
		}
	})

};