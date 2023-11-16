<script>
	import {
		getBindDevices,
		getLoseDevice,
		updateLocation,
	} from '@/utils/services';

	export default {
		globalData: {
			SystemInfo: {},
			userInfo: {},
		},
		onLaunch: function() {
			console.log('App Launch')
			this.init();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide');

		},
		methods: {
			init() {
				console.log('App init');
				uni.getSystemInfo({
					success: function(res) {
						getApp().globalData.SystemInfo = res;
					}
				});
				// 初始化蓝牙模块
				uni.openBluetoothAdapter({
					success: e => {
						this.queryLoseDevice();
					},
					fail: (err) => {
						console.log(JSON.stringify(err))
					}
				});
                this.checkLoginStatus();

			},
			
            checkLoginStatus() {
            	const token = uni.getStorageSync('User-Access-Token');
            	if (!token) {
            		uni.reLaunch({
            			url: '/pages/login/signin',
                        success: () => {
                            plus.navigator.closeSplashscreen();   
                        },
                        fail: (err) => {
                            console.log('reLaunch Error: '+JSON.stringify(err))
                        }
            		});
            	} else {
                    plus.navigator.closeSplashscreen();   
                }
            },
            
			async queryLoseDevice() {
				const res = await getLoseDevice();
				console.log('获取已丢失设备： ' + JSON.stringify(res));
				if (res.success) {
					res.data.forEach((item) => {
						this.createBLEConnection(item.deviceId);
					});
				}
			},

			createBLEConnection(deviceId) {
				uni.createBLEConnection({
					deviceId,
					success: res => {
						this.getLocation(deviceId);
					},
					fail: (err) => {
						if (err.code === 10012) {
							this.createBLEConnection(deviceId);
						}
					}
				});
			},

			getLocation(deviceId) {
				uni.getLocation({
					type: 'gcj02',
					geocode: true,
					isHighAccuracy: true,
					success: (res) => {
						this.rexportLocation({
							...res,
							deviceId
						});
					}
				})
			},

			rexportLocation(params) {
				console.log('上报已丢失设备位置');
				const {
					latitude,
					longitude,
					address,
					deviceId
				} = params;
				const updateTime = Date.now();
				updateLocation({
					latitude,
					longitude,
					address,
					deviceId,
					updateTime
				});
			}

		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	// @import '@/uni_modules/uni-scss/index.scss';
</style>