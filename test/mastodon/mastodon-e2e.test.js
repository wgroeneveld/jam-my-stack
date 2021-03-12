
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

		let dir = await fsp.readdir(`${dumpdir}/2021/03`, { withFileTypes: true })
		expect(dir.length).not.toBe(0)
	})

})
