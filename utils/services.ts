import Request from "./request";
const request = new Request().http;

// 登录
export const userLogin = (data: {account: string; password: string})=> {
	return request({
		url: '/user/login',
		method: "POST",
		data: data,
	});
}

// 注册
export const userSignup = (data: {account: string; password: string})=> {
	return request({
		url: '/user/signup',
		method: "POST",
		data: data,
	});
}

// 获取登录用户信息
export const getLoginUser = () => {
	return request({
		url: '/user/getLoginUser',
		method: "GET",
		data: null
	});
}

// 获取当前用户绑定的蓝牙列表
export const getBindDevices = () => {
	return request({
		url: "/device/getDevice",
		method: "GET",
		data: null,
	});
};


type CreateConnectDto = {
	deviceId : string;
	name : string;
	userId : string;
	latitude : number;
	longitude : number;
	address : object;
};
// 创建链接
export const createDeviceConnect = (data : CreateConnectDto) => {
	return request({
		url: "/device/connect",
		method: "POST",
		data: data,
	});
};


type UpdateLocationDto = {
	deviceId : string;
	latitude : string;
	longitude : string;
	address : string;
	updateTime : string;
}
// 更新位置信息
export const updateLocation = (data : UpdateLocationDto) => {
	return request({
		url: '/device/updateLocation',
		method: "POST",
		data: data,
	});
}

// 获取已标记丢失的设备
export const getLoseDevice = () => {
	return request({
		url: '/device/getLoseDevice',
		method: "GET",
	});
}

// 标记丢失状态
export const updateDeviceLoseStatus = (data: any) => {
	return request({
		url: '/device/updateLoseStatus',
		method: "PUT",
		data: data
	});
}

// 移除设备
export const removeDevice = (deviceId: string) => {
	return request({
		url: '/device/delete',
		method: 'DELETE',
		data: { deviceId }
	});
}

// 重命名设备
type RenameDot = {
	deviceId: string;
	name: string;
}
export const renameDevice = (data: RenameDot) => {
	return request({
		url: '/device/rename',
		method: 'PUT',
		data: data
	});
}