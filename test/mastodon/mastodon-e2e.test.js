
const fs = require('fs');
const fsp = require('fs').promises;
const { rmdir } = require('./../utils')

jest.disableAutomock()
jest.unmock('got')

const { parseMastoFeed } = require('../../src/mastodon/feed-parser')
const dumpdir = `${__dirname}/dump`

describe("mastodon feed parser end to end scenario test", () => {

	beforeEach(() => {
		if(fs.existsSync(dumpdir)) {
			rmdir(dumpdir)
		}
		fs.mkdirSync(dumpdir)
	});

	test("parse creates separate notes in each month subdir", async () => {
		await parseMastoFeed({
			url: "https://chat.brainbaking.com/users/wouter/feed",
			notesdir: dumpdir
		})

		const dirroot = await fsp.readdir(`${dumpdir}`, { withFileTypes: true })
		expect(dirroot.length).toBe(1)
		const year = dirroot[0].name

		const dirmonth = await fsp.readdir(`${dumpdir}/${year}`, { withFileTypes: true })
		expect(dirmonth.length).toBe(1)
		const month = dirmonth[0].name

		const dir = await fsp.readdir(`${dumpdir}/${year}/${month}`, { withFileTypes: true })
		expect(dir.length).not.toBe(0)
	})

})
