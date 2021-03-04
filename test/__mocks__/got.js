const fs = require('fs').promises

async function got() {
	return fs.readFile('./test/__mocks__/masto-feed-sample.xml', 'utf8');
}

module.exports = got
