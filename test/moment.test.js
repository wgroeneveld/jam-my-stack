
// momentjs verification tests
const moment = require('moment')

test('momentjs from UTC to UTC+1', () => {
	
	const date = moment
		.utc("2021-03-02T16:13:27.921888Z")
		.utcOffset("+01:00")

	expect(date.format("YYYY-MM-DD")).toEqual("2021-03-02")
	expect(date.format("HH-mm-ss")).toEqual("17-13-27")
})
