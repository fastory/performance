module.exports =  function monitor(page) {
	page.on('pageerror', msg => { //页面中js错误
		console.log('pageerror', msg)
	});
	page.on('requestfailed', msg => { //网络请求超时
		let {_failureText, _method, _resourceType, _url} = msg;
		console.log('requestfailed', _failureText, _method, _resourceType, _url)
	});
	page.on('console', msg => { //网络请求错误
		let {_location, _text, _type} = msg;
		if (_type === 'error') {
			let {url, lineNumber} = _location;
			console.log(`console=-==-${url},${lineNumber},${_text}`)
		}
	});
}
