const MockDate = require('mockdate')
const dayjs = require('dayjs')


describe("webmention send serve-my-jam tests", () => {

	const fs = require('fs');
	const fsp = require('fs').promises;
	const { rmdir } = require('./../utils')

	const got = require('got')
	

	const { sendWebmentions } = require('./../../src/webmention/send')
	const domain = "brainbaking.com"
	const dumpdir = `${__dirname}/dump`

	beforeEach(() => {
		MockDate.set(dayjs('2021-03-11T19:00:00').toDate())
		got.put = jest.fn()

		if(fs.existsSync(dumpdir)) {
			rmdir(dumpdir)
		}
		fs.mkdirSync(dumpdir)
	});


	test("sendWebmentions without a config creates a file with current date as since", async() => {
		await sendWebmentions('brainbaking.com', `${dumpdir}/send.json`)

		const config = (await fsp.readFile(`${dumpdir}/send.json`)).toString()
		const since = JSON.parse(config).since

		expect(got.put).toHaveBeenCalledWith("https://jam.brainbaking.com/webmention/brainbaking.com/miauwkes?since=")
		expect(since).toBe(dayjs('2021-03-11T19:00:00').toDate().toISOString())
	})

	test("sendWebmentions with a previous since sets that since as a query parameter", async() => {
		const sinceSetup = dayjs('2020-01-01T20:00:00').toDate().toISOString()
		await fsp.writeFile(`${dumpdir}/send.json`, JSON.stringify({ since: sinceSetup }), 'utf-8')

		await sendWebmentions('jefklakscodex.com', `${dumpdir}/send.json`)

		const config = (await fsp.readFile(`${dumpdir}/send.json`)).toString()
		const since = JSON.parse(config).since

		expect(got.put).toHaveBeenCalledWith(`https://jam.brainbaking.com/webmention/jefklakscodex.com/miauwkes?since=${sinceSetup}`)
		expect(since).toBe(dayjs('2021-03-11T19:00:00').toDate().toISOString())
	})

})
