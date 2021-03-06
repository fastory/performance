const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

// eslint-disable-next-line no-unused-vars


module.exports = function launchChromeAndRunLighthouse(url, opts, config = null) {
	return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
		opts.port = chrome.port;
		return lighthouse(url, opts, config).then(results => {
			// use results.lhr for the JS-consumeable output
			// https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
			// use results.report for the HTML/JSON/CSV output as a string
			// use results.artifacts for the trace/screenshots/other specific case you need (rarer)
			return chrome.kill().then(() => results.report)
		});
	});
}





