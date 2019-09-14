const express = require('express')
const bodyParser = require('body-parser');
const redis = require('./redis');
const lighthouse = require('./lighthouse');
const {throttling} = require('lighthouse/lighthouse-core/config/constants');
// const performance = require('./performance');
const app = express()

app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.sendFile(`${__dirname}/index.html`)
})
app.get('/see',function (req,res) {
	res.setHeader('Content-Type', 'text/html');
	let {id}=req.query;
	redis.get('lighthouseRes'+id).then( data =>{
		res.send(data);
	});
})

app.post('/addPerform', function (req, res) {
	redis.get("performId").then(performId => {
			return performId;
		}
	).then(performId => {
		let id;
		if (performId == null || performId == undefined) {
			id = 0;
		} else {
			id = parseInt(performId) + 1;
		}
		let obj = req.body;
		if (id == 0) {
			redis.set("perFormList", [{...obj, id: id}]);
			redis.set("performId", id);
		} else {
			redis.get("perFormList").then(data => {
				data.push({...obj, id: id});
				redis.set("perFormList", data);
				redis.set("performId", id);
			});
		}
		res.json({
			status: '200',
			message: 'success',
			data:id
		});
	})
})
app.get('/perFormList', function (req, res) {
	redis.get("perFormList").then(data => {
		res.json({
			status: '200',
			message: 'success',
			data: data,
			page: data.length
		});
	});
})
app.post('/addTime', function (req, res) {
	redis.get("timeId").then(timeId => {
			return timeId;
		}
	).then(timeId => {
		let id;
		if (timeId == null || timeId == undefined) {
			id = 0;
		} else {
			id = parseInt(timeId) + 1;
		}
		let obj = req.body;
		if (id == 0) {
			redis.set("timeList", [{...obj, id: id}]);
			redis.set("timeId", id);
		} else {
			redis.get("timeList").then(data => {
				data.push({...obj, id: id});
				redis.set("timeList", data);
				redis.set("timeId", id);
			});
		}
		res.json({
			status: '200',
			message: 'success',
			data:id
		});
	})
})
app.get('/timeList', function (req, res) {
	redis.get("timeList").then(data => {
		res.json({
			status: '200',
			message: 'success',
			data: data,
			page: data.length
		});
	});
})

app.get('/setId', function (req, res) {
	redis.set('id', 0);
	redis.set('perFormList',  [ { name: '测试下',
		mobile: 'test',
		network: '3G',
		hasReport: false,
		url: 'http://wx.10086.cn/website/personalHome/new/index',
		id: 0 } ]
	);
	res.json({
		status: '200',
		message: '设置id成功',
	});
})
app.get('/webevaluate', async function (req, res) {
	let {network = '4g',id =0,url='http://wx.10086.cn/website/personalHome/new/index'} = req.query;
	let networkMap = {
		'3g': throttling.mobileRegluar3G,
		'4g': throttling.mobileSlow4G,
	}
	const opts = {
		chromeFlags: ['--show-paint-rects', '--window-size=412,660', '--headless'],
		locale: 'zh',
		// extraHeaders: {
		// 	cookie: "koa.sid=xLk0fsuGFFXjNAdTmuW6ICRfZHtU4mpk"
		// },
		output: 'html',
		onlyCategories: ['performance', 'best-practices', 'seo', 'pwa'],
		throttling: networkMap[network] //mobileSlow4G
	};
	let lighthouseRes = await lighthouse(url, opts);
	redis.set('lighthouseRes'+id, lighthouseRes);
	redis.get("perFormList").then(data => {
		data[id].hasReport=true;
		redis.set('perFormList', data);
	});
	res.json({
		status: '200',
		message: 'success',
		url: url
	});
	// res.send(lighthouseRes)
})

/*
app.get('/performance', async function (req, res) {
	let {url = 'http://wx.10085.cn/hackertree/index?mobile=13671166796&nickname=stone2212', network = '4g', count = 1,useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'} = req.query;
	let opts = {
		url,
		count,
		headless: false,
		noCache: false,
		offline: false,
		javascript: true,
		noOnline: false,
		useragent,
		network,
		viewport: {
			width: 375,
			height: 812,
			deviceScaleFactor: 3,
			isMobile: false,
			hasTouch: false,
			isLandscape: false
		}
	}
	let data = await performance(opts)
	res.json({
		status: '200',
		message: 'success',
		data: data,
	});
	// res.send(data);
})
*/


app.use('/static', express.static('dist'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
