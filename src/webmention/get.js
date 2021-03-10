
const got = require('got')
const config = require('../config')

const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

async function getWebmentions(domain) {
	const url = `${config.serveMyJamEndpoint}/webmention/${domain}/${config.serveMyJamToken}`
	const result = await got(url)

	result.body.json.forEach(mention => {
		mention.publishedFromNow = dayjs(mention.published).fromNow()
		mention.relativeTarget = mention.target.substring(mention.target.indexOf(domain) + domain.length, mention.target.length)
	})

	return result.body.json.sort((a, b) => dayjs(b.published).toDate() - dayjs(a.published).toDate())
}

module.exports = {
	getWebmentions
}
