const Util = require('./util')


class Analyzer {
	constructor(data) {
		this.data = data
	}

	/**
	 * @param {Number} domainLookupStart 返回用户代理对当前文档所属域进行DNS查询开始的时间。
	 * 如果此请求没有DNS查询过程，如长连接，资源cache,甚至是本地资源等。 那么就返回 fetchStart的值
	 * @param {Number} domainLookupEnd 返回用户代理对结束对当前文档所属域进行DNS查询的时间。
	 * 如果此请求没有DNS查询过程，如长连接，资源cache，甚至是本地资源等。那么就返回 fetchStart的值
	 * @returns {Number} DNS查询耗时
	 */
	static getDNSTime(domainLookupStart, domainLookupEnd) {
		return domainLookupEnd - domainLookupStart;
	}

	/**
	 * @param {Number} connectStart 返回用户代理向服务器服务器请求文档，开始建立连接的那个时间，
	 * 如果此连接是一个长连接，又或者直接从缓存中获取资源（即没有与服务器建立连接）。
	 * 则返回domainLookupEnd的值
	 * @param {Number} connectEnd 返回用户代理向服务器服务器请求文档，
	 * 建立连接成功后的那个时间，如果此连接是一个长连接，又或者直接从缓存中获取资源（即没有与服务器建立连接）。
	 * 则返回domainLookupEnd的值
	 * @returns {Number} TCP链接耗时
	 */
	static getTCPTime(connectStart, connectEnd) {
		return connectEnd - connectStart;
	}

	/**
	 * @param {Number} responseStart 返回用户代理从服务器、缓存、本地资源中，接收到第一个字节数据的时间
	 * @param {Number} responseEnd 返回用户代理接收到最后一个字符的时间，和当前连接被关闭的时间中，更早的那个。
	 * 同样，文档可能来自服务器、缓存、或本地资源
	 * @returns {Number} 网页本身的下载耗时
	 */
	static getDownloadTime(responseStart, responseEnd) {
		return responseEnd - responseStart
	}

	/**
	 *
	 * @param {Number} domInteractive 准备加载新页面的起始时间
	 * @param {Number} domComplete readyState = complete的时候
	 * @returns {Number} 解析DOM Tree耗时
	 * 这个说法有点儿不严谨，这个只能当做dom加载完毕以后，子资源的下载耗时，名字起的容易让人误解
	 */
	static getAfterDOMReadyTheDownloadTimeOfTheRes(domInteractive, domComplete) {
		return domComplete - domInteractive;
	}

	/**
	 *
	 * @param {Number} firstPaintTime 首次渲染时间
	 * @param {Number} navigationStart 返回用户代理从服务器、缓存、本地资源中，接收到第一个字节数据的时间
	 * @returns {Number} 白屏时间
	 */
	static getWhiteScreenTime(navigationStart, firstPaintTime) {
		return firstPaintTime - navigationStart
	}

	/**
	 *
	 * @param {*} navigationStart
	 * @param {*} domContentLoadedEventEnd
	 */
	static getDOMReadyTime(navigationStart, domContentLoadedEventEnd) {
		return domContentLoadedEventEnd - navigationStart;
	}

	/**
	 *
	 * @param {Number} navigationStart 准备加载新页面的起始时间
	 * @param {Number} loadEventEnd 文档触发load事件结束后的时间。如果load事件没有触发，那么该接口就返回0
	 * @returns {Number} DOM Ready耗时
	 */
	static getLoadTime(navigationStart, loadEventEnd) {
		return loadEventEnd - navigationStart
	}

	static getAverage(total, length) {
		return total / length
	}

	/**
	 *
	 * @param {Number} requestStart
	 * @param {Number} responseStart
	 * @return {Number} TTFB
	 * TTFB (Time To First Byte)，是最初的网络请求被发起到从服务器接收到第一个字节这段时间，
	 * 它包含了 TCP连接时间，发送HTTP请求时间和获得响应消息第一个字节的时间。 - 上面是百度百科的解释
	 * 但是在chrome上，只包含刚开始发送request到接收到第一个byte的时间，
	 * 发送request前面的预操作则不算在内
	 */
	static getTTFB(requestStart, responseStart) {
		return responseStart - requestStart
	}

	statistics(data = this.data) {
		if (!data) {
			return
		}
		if (!Array.isArray(data)) {
			data = [data]
		}
		let length = data.length // 分析次数
		// DNS查询耗时
		let totalDNSTime = 0
		// TCP链接耗时
		let totalTCPTime = 0
		// TTFB
		let totalTTFBTime = 0
		// donwload资源耗时
		let totalDownloadTime = 0
		// 解析dom树耗时
		let totalAfterDOMReadyTheDownloadTimeOfTheRes = 0
		// 白屏时间
		let totalWhiteScreenTime = 0
		// domready时间
		let totalDOMReadyTime = 0
		// onload时间
		let totalLoadTime = 0

		for (let item of data) {
			let {performance, firstPaintTime} = JSON.parse(item)
			// console.log(entries)
			let {
				navigationStart,
				domainLookupStart,
				domainLookupEnd,
				connectStart,
				connectEnd,
				requestStart,
				responseStart,
				responseEnd,
				// domLoading,
				domInteractive,
				// domContentLoadedEventStart,
				domContentLoadedEventEnd,
				domComplete,
				// loadEventStart,
				loadEventEnd
			} = performance.timing

			totalDNSTime += Analyzer.getDNSTime(domainLookupStart, domainLookupEnd)
			totalTCPTime += Analyzer.getTCPTime(connectStart, connectEnd)
			totalTTFBTime += Analyzer.getTTFB(requestStart, responseStart)
			totalDownloadTime += Analyzer.getDownloadTime(responseStart, responseEnd)
			totalAfterDOMReadyTheDownloadTimeOfTheRes += Analyzer.getAfterDOMReadyTheDownloadTimeOfTheRes(domInteractive, domComplete)
			totalWhiteScreenTime += Analyzer.getWhiteScreenTime(navigationStart, firstPaintTime)
			totalDOMReadyTime += Analyzer.getDOMReadyTime(navigationStart, domContentLoadedEventEnd)
			totalLoadTime += Analyzer.getLoadTime(navigationStart, loadEventEnd)
		}
		return {
			total: {
				dnsTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalDNSTime, length)),
				tcpTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalTCPTime, length)),
				TTFB: Util.formatMSToHumanReadable(Analyzer.getAverage(totalTTFBTime, length)),
				pageDownloadTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalDownloadTime, length)),
				whiteScreenTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalWhiteScreenTime, length)),
				DOMReadyTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalDOMReadyTime, length)),
				afterDOMReadyDownloadTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalAfterDOMReadyTheDownloadTimeOfTheRes, length)),
				loadTime: Util.formatMSToHumanReadable(Analyzer.getAverage(totalLoadTime, length))
			}
		}
	}
}

module.exports = Analyzer
