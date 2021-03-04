const fs = require('fs')

const fakedata = fs.readFileSync('./test/expected-goodreads-content.js')

function getmock(url, callback) {
	callback({
		on: function(id, callback) {
			if(id === "data") callback(fakedata)
			if(id === "end") callback()
		}
	})
}

module.exports = {
	"get": getmock
}
