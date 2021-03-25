
const got = require('got')
const config = require('../config')

const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

async function getWebmentions(domain) {
	const url = `${config.serveMyJamEndpoint}/webmention/${domain}/${config.serveMyJamToken}`
	const result = await got(url)

	if(!result.body || !result.body) {
		return []
	}
	const json = JSON.parse(result.body).json

	json.forEach(mention => {
		mention.relativeTarget = mention.target.substring(mention.target.indexOf(domain) + domain.length, mention.target.length)
	})

	return json.sort((a, b) => dayjs(b.published).toDate() - dayjs(a.published).toDate())
}

module.exports = {
	getWebmentions
}
