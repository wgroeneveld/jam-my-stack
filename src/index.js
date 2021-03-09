const { parseMastoFeed } = require('./mastodon/feed-parser')
const { widgetify } = require('./goodreads/widgetify.js')
const { buildIndex } = require('./lunr/index-builder.js')
const { howlong } = require('./howlongtobeat/howlong.js')

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
	}
};
