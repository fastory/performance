// 性能数据生成对象
const Performance = require('./performance')
// 统计分析对象
const Analyzer = require('./analyzer')
const performance = new Performance()
const analyzer = new Analyzer()

module.exports = function(opts) {
	return performance.run(opts).then(async statisticData => {
		let data = await analyzer.statistics(statisticData)
		console.log('data:', data)
		return data;
	})
}
