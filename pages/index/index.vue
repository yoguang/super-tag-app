<template>
    <view>
        <map id="map1" theme="satellite" :latitude="latitude" :longitude="longitude" :markers="markers"
            @markertap="onMarkertap">
        </map>
    </view>
</template>
<script>
    import {
        getBindDevices
    } from '@/utils/services';
    import {
        addressToStr
    } from '@/utils/index';

    const markerImg = '../../static/marker.png';
    const myPositionImg = '../../static/my_position.png';

    export default {
        data() {
            return {
                latitude: '',
                longitude: '',
                markers: [],
                bindedTags: []
            }
        },

        onLoad() {
            console.log('Page Map onLoad')
            this.subNVuePopup = uni.getSubNVueById('popup');
            this.subNVuePopup.hide();
            this.subNVueStuffInfo = uni.getSubNVueById('stuff-info');
            this.subNVueStuffInfo.hide();
            this.subNVueStuffList = uni.getSubNVueById('stuff-list');
            this.subNVueStuffList.show('slide-in-bottom');
            // 监听子窗体是否已load开始获取设备列表
            uni.$on('subnvue-loaded', () => {
                this.getDevices();
            });
        },

        onReady() {
            console.log('Page Map onReady')
            this._map = uni.createMapContext('map1', this);
        },

        onShow() {
            this.getDevices();
        },

        onHide() {
            uni.hideLoading();
        },

        methods: {
            async getDevices() {
                try {
                    console.log('-------------------获取用户设备-------------------------')
                    const res = await getBindDevices();
                    console.log(JSON.stringify(res))
                    console.log('-------------------获取用户设备-------------------------')
                    if (res.success) {
                        this.bindedTags = res.data.map((item) => ({
                            ...item,
                            address: addressToStr(item.address)
                        }));
                        this.markers = this.bindedTags.map(item => ({
                            id: item.id,
                            latitude: item.latitude,
                            longitude: item.longitude,
                            iconPath: markerImg,
                        }));
                        uni.$emit('emit-user-binded-tags', this.bindedTags);
                        this.getLoaction();
                    }
                } catch (e) {
                    console.error('getDevices Error: \n' + JSON.stringify(e));
                }
            },

            // 点击地图上的 marker 节点
            onMarkertap(evt) {
                const {
                    detail: {
                        markerId
                    }
                } = evt;
                const _device = this.bindedTags.find(item => item.id === markerId);
                this.subNVue = uni.getSubNVueById('stuff-info');
                this.subNVue.show('slide-in-bottom');
                uni.$emit('selecte-stuff', _device);
            },
            getLoaction() {
                uni.getLocation({
                    type: 'gcj02',
                    geocode: true,
                    isHighAccuracy: true,
                    success: (res) => {
                        console.log('获取当前位置：' + JSON.stringify(res));
                        const {
                            latitude,
                            longitude,
                            address
                        } = res;
                        this.latitude = latitude;
                        this.longitude = longitude;
                        const location = {
                            latitude,
                            longitude,
                        };
                        const currentMarker = this.markers.find(item => item.id === 0);
                        console.log('currentMarker-----'+JSON.stringify(currentMarker))
                        // 更新用户的当前位置 marker
                        if (currentMarker) {
                            this.markers[0] = {
                                ...currentMarker,
                                latitude,
                                longitude,
                            }
                        } else {
                            this.markers.unshift({
                                id: 0,
                                anchor: {
                                    x: .5,
                                    y: .5
                                },
                                latitude,
                                longitude,
                                iconPath: myPositionImg,
                            });
                        }
                        uni.$emit('emit-current-location', location);

                    },
                    fail(err) {}
                })
            }
        }
    }
</script>
<style scoped>
    map {
        width: 100vw;
        height: 100vh;
    }

    .cover {
        width: 100%;
        height: 100rpx;
        background-color: red;
    }

    .popup-content {
        background-color: red;
        font-size: 60rpx;
    }

    .customCallout {
        background-color: #fff;
        background: #FFFFFF;
        box-shadow: 0px 8rpx 32rpx 0px rgba(189, 191, 193, 0.4);
        border-radius: 10rpx;
        padding: 6rpx 24rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
    }

    .content-image {
        width: 60rpx;
        height: 60rpx;
        margin-left: 10rpx;
    }
</style>