
const got = require('got')
const config = require('../config')
const fsp = require('fs').promises

const dayjs = require('dayjs')

async function sendWebmentions(domain) {
	const url = `${config.serveMyJamEndpoint}/webmention/${domain}/${config.serveMyJamToken}`

	// this is an async call and will return 202 to say "started sending them out".
	const result = await got.put(url)
}

module.exports = {
	sendWebmentions	
}
