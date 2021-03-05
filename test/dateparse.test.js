
// momentjs verification tests
var dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

test('momentjs from UTC to UTC+1', () => {
	
	const date = dayjs
		.utc("2021-03-02T16:13:27.921888Z")
		.utcOffset(60)

	expect(date.format("YYYY-MM-DD")).toEqual("2021-03-02")
	expect(date.format("HH-mm-ss")).toEqual("17-13-27")
})
