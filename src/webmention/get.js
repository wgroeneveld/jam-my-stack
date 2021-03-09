
const got = require('got')
const config = require('../config')

const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

async function getWebmentions() {
	const url = `${config.serveMyJamEndpoint}/webmention/${config.serveMyJamDomain}/${config.serveMyJamToken}`
	const result = await got(url)

	result.body.json.forEach(mention => {
		mention.publishedFromNow = dayjs(mention.published).fromNow()
	})

	return result.body.json.sort((a, b) => dayjs(b.published).toDate() - dayjs(a.published).toDate())
}

module.exports = {
	getWebmentions
}
