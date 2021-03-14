const fs = require('fs').promises

async function got(url) {
	console.log(`through got mock, url ${url}`)
	if(url.indexOf('/webmention') >= 0) {
		const result = await fs.readFile(`./test/__mocks__/get-sample.json`, 'utf8');
		return {
			// WHY not a JSON.parse here? The body is a STRING IRL!
			body: result
		}
	}

	const result = await fs.readFile(`./test/__mocks__/${url}.xml`, 'utf8');
	return result
}

module.exports = got
