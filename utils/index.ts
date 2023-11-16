import { gcj02tobd09 } from './latlngTransform';

/**
 * 打开第三方地图应用
*/
type Locaion = {
	longitude : number;
	latitude : number;
	address : string;

}
export const openMap = (locaion : Locaion) => {
	let url = "";
	const { latitude, longitude, address } = locaion;
	console.log(JSON.stringify(locaion), '<======openMap');
	const bdll = gcj02tobd09(longitude, latitude);
	let urlBaiduMap =
		`baidumap://map/marker?location=${bdll[1]},${bdll[0]}&title=${address}&src=New%20Link`;
	if (plus.os.name == "Android") {
		let urlAndroidAmap =
			`androidamap://viewMap?sourceApplication=New%20Link&poiname=${address}&lat=${latitude}&lon=${longitude}&dev=0`;
		let hasBaiduMap = plus.runtime.isApplicationExist({
			pname: 'com.baidu.BaiduMap',
			action: 'baidumap://'
		});
		let hasAmap = plus.runtime.isApplicationExist({
			pname: 'com.autonavi.minimap',
			action: 'androidamap://'
		});
		if (hasAmap && hasBaiduMap) {
			plus.nativeUI.actionSheet({
				title: "选择地图应用",
				cancel: "取消",
				buttons: [{
					title: "百度地图"
				}, {
					title: "高德地图"
				}]
			}, function (e) {
				switch (e.index) {
					case 1:
						plus.runtime.openURL(urlBaiduMap);
						break;
					case 2:
						plus.runtime.openURL(urlAndroidAmap);
						break;
				}
			})
		} else if (hasAmap) {
			plus.runtime.openURL(urlAndroidAmap);
		} else if (hasBaiduMap) {
			plus.runtime.openURL(urlBaiduMap);
		} else {
			url = `geo:${latitude},${longitude}?q=New%20Link`;
			plus.runtime.openURL(url); //如果是国外应用，应该优先使用这个，会启动google地图。这个接口不能统一坐标系，进入百度地图时会有偏差
		}
	} else {
		// iOS上获取本机是否安装了百度高德地图，需要在manifest里配置，在manifest.json文件app-plus->distribute->apple->urlschemewhitelist节点下添加（如urlschemewhitelist:["iosamap","baidumap"]）
		// "http://maps.apple.com/?q=%e6%95%b0%e5%ad%97%e5%a4%a9%e5%a0%82&ll=39.96310,116.340698&spn=0.008766,0.019441";
		const urlAppleMap = `http://maps.apple.com/?q=${encodeURIComponent(address)}&ll=${latitude},${longitude}`;
		const urliOSAMap = `iosamap://viewMap?sourceApplication=New%20Link&poiname=${address}&lat=${latitude}&lon=${longitude}&dev=01`;
		plus.nativeUI.actionSheet({
			title: "选择地图应用",
			cancel: "取消",
			buttons: [{
				title: "苹果地图"
			}, {
				title: "百度地图"
			}, {
				title: "高德地图"
			}]
		}, function (e) {
			console.log("e.index: " + e.index);
			switch (e.index) {
				case 1:
					url = urlAppleMap;
					break;
				case 2:
					url = urlBaiduMap;
					break;
				case 3:
					url = urliOSAMap
					break;
				default:
					break;
			}
			if (url != "") {
				console.log(url)
				plus.runtime.openURL(url, function (e) {
					console.log(JSON.stringify(e));
					plus.nativeUI.alert("本机未安装指定的地图应用");
				});
			}
		})
	}
}

//进行经纬度转换为距离的计算
function Rad(d : number) {
	return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
}
/**
 * 计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
 * @param loca1 {lat, lng}
 * @param loca2 {lat, lng}
*/
type loca = { latitude : number, longitude : number }
export const calculateDistance = (location1 : loca, location2 : loca) => {
	const { latitude: lat1, longitude: lng1 } = location1;
	const { latitude: lat2, longitude: lng2 } = location2;
	const radLat1 = Rad(lat1);
	const radLat2 = Rad(lat2);
	const a = radLat1 - radLat2;
	const b = Rad(lng1) - Rad(lng2);
	let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
		Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	s = s * 6378.137; // EARTH_RADIUS;
	s = Math.round(s * 10000) / 10000; //输出为公里
	console.log('距离', s);
	// 小于1米显示在你身边
	if (s < 0.001) {
		return {
			value: s,
			text: `在你身边`
		}
	}
	// 小于10米显示附近
	if (s < 0.01) {
		return {
			value: s,
			text: `附近`
		};
	}
	// 小于0.1公里显示多少米
	if (s < 0.1) {
		return {
			value: s,
			text: `${(s * 1000).toFixed()}米`
		};
	}
	return {
		value: s,
		text: `${s.toFixed(2)}公里`
	};
}


// 返回详情地址拼接后的字符串
type Address = {
	country : string;
	province : string;
	city : string;
	district : string;
	street : string;
}
export const addressToStr = (address : Address) => {
	const {
		country,
		province,
		city,
		district,
		street
	} = address;
	return country + province + city + district + street;
}