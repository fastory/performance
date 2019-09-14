const puppeteer = require('puppeteer')
const monitor = require('./monitor')
module.exports = class Performance {
	constructor(opts) {
		this.opts = opts
	}

	async run(opts = this.opts) {
		let startTimestamp = Date.now()
		let {
			url,
			count,
			useragent,
			viewport,
			cookies,
			cache,
			javascript,
			offline,
			network
		} = opts

		let launchOpts = {
			headless: false
		}
		const browser = await puppeteer.launch(launchOpts)

		async function pageTask() {
			let page = await browser.newPage()
			const client = await page.target().createCDPSession()
			let NETWORK_PRESETS = {
				'3g': {
					'offline': false,
					'downloadThroughput': 750 * 1024 / 8,
					'uploadThroughput': 250 * 1024 / 8,
					'latency': 100
				},
				'4g': {
					'offline': false,
					'downloadThroughput': 4 * 1024 * 1024 / 8,
					'uploadThroughput': 3 * 1024 * 1024 / 8,
					'latency': 20
				}
			}
			// Set throttling property
			await client.send('Network.emulateNetworkConditions', NETWORK_PRESETS[network])
			page.setCacheEnabled(cache);
			page.setJavaScriptEnabled(javascript);
			page.setOfflineMode(offline);
			page.setRequestInterception(false);
			page.setViewport(viewport);
			page.setUserAgent(useragent)
			monitor(page);
			await page.goto(url, {
				timeout: 0
			})
			return await page.evaluate(async () => {
				let performance = window.performance;
				await new Promise(function (resolve, reject) {
					setTimeout(function () {
						resolve()
					}, 2000)
				})
				let firstPaintTime = performance.getEntriesByType('paint')[0].startTime + performance.timeOrigin;
				return JSON.stringify({performance, firstPaintTime})
			})
		}

		let browserTask = [...new Array(count)].map(() => pageTask)

		async function queue(arr) {
			let res = null
			for (let promise of arr) {
				res = await promise(res)
			}
			return await res
		}

		let performance = await queue(browserTask)
		await browser.close();
		console.log(`跑完${url} 全部性能测试用时：${(Date.now() - startTimestamp - 2000) / 1000}s`)
		console.log(`\n---------------------- 🚀 各项指标平均耗时（${count}次）----------------------\n`)
		return performance
	}
}


