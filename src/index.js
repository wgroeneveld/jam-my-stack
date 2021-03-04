const { parseMastoFeed } = require('./masto-feed-parser')
const { widgetify } = require('./goodreads-widgetify.js')

module.exports = {
	parseMastoFeed,
	goodreadsWidgetify: widgetify
};
