const https = require('https')


// WHY? Because including this thing comes with free cookies...

const replaceLowresWithHiresImages = (data) => {
	return data.replace(/_SX[0-9]+_(SY[0-9]+_)*.jpg/g, "_S400_.jpg")
}

function widgetify(url) {
	return new Promise(resolve => {
		https.get(url, (resp) => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				resolve(replaceLowresWithHiresImages(data))
			});
		})
	})
}

module.exports = {
	widgetify
}
