type RequestConfig = {
	url: string;
	method: "POST" | "GET" | "DELETE" | "PUT",
	data?: any,
	header?: any,
}
export default class Request {
	
	
	http(param: RequestConfig) {
		let url = param.url;
		let method = param.method;
		let header = param.header || {};
		let data = Object.assign(param.data || {});
		let _accessToken: string = '';
		if (!_accessToken) {
			const token = uni.getStorageSync('User-Access-Token');
			_accessToken = token;
		}
		
		if (method) {
			if (method == "POST") {
				header = Object.assign({ }, param.header)
			} else {
				header = Object.assign({
					'content-type': "application/json"
				}, param.header)
			}
		}
		
		// 添加登录令牌 Token 到 header Authorization
		header.Authorization = _accessToken;
		
		let origin = 'http://123.57.242.8:3000';
		if (process.env.NODE_ENV === 'development') {
			origin = 'http://192.168.2.101:3000';
		}
		
		let requestUrl = origin + url;
		return new Promise((resolve, reject) => {
			uni.request({
				url: requestUrl,
				data: data,
				method: method,
				header: header,
				success: (res: any) => {
					if (res.statusCode === 401) {
						uni.redirectTo({
							url: '/pages/login/signin'
						});
						return;
					}
					if (res.statusCode === 404) {
						uni.showToast({
							title: res.data?.message
						});
						return
					}
					if (res.statusCode === 200 || res.statusCode === 201) {
						resolve(res.data);
					}
				},
				fail: (err) => {
						console.log('request fail: '+ JSON.stringify(err));
						reject(err);
			        },
			    })
		})
	}
}
