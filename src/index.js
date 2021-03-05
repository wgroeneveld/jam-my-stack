const { parseMastoFeed } = require('./masto-feed-parser')
const { widgetify } = require('./goodreads-widgetify.js')
const { buildIndex } = require('./lunr-index-builder.js')

module.exports = {
	mastodon: {
		parseFeed: parseMastoFeed
	},
	goodreads: {
		createWidget: widgetify
	},
	lunr: {
		buildIndex: buildIndex
	}
};
