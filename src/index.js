const { parseMastoFeed } = require('./mastodon/feed-parser')
const { widgetify } = require('./goodreads/widgetify.js')
const { buildIndex } = require('./lunr/index-builder.js')
const { howlong } = require('./howlongtobeat/howlong.js')
const { thumbify } = require('./youtube/thumbify.js')

const { getWebmentions } = require('./webmention/get.js')
const { sendWebmentions } = require('./webmention/send.js')

module.exports = {
	mastodon: {
		parseFeed: parseMastoFeed
	},
	goodreads: {
		createWidget: widgetify
	},
	lunr: {
		buildIndex: buildIndex
	},
	howlongtobeat: {
		howlong: howlong
	},
	youtube: {
		thumbify: thumbify
	},
	webmention: {
		getWebmentions: getWebmentions,
		send: sendWebmentions
	}
};
