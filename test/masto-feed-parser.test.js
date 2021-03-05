const fs = require('fs');
const fsp = require('fs').promises;
const { rmdir } = require('./utils')

const frontMatterParser = require('parser-front-matter');

jest.mock('got');

const { parseMastoFeed } = require('../src/masto-feed-parser')
const dumpdir = `${__dirname}/dump`

describe("mastodon feed parser tests", () => {
	beforeEach(() => {
		if(fs.existsSync(dumpdir)) {
			rmdir(dumpdir)
		}
		fs.mkdirSync(dumpdir)
	});

	test("parse creates separate notes in each month subdir", async () => {
		await parseMastoFeed({
			url: "invalid",
			notesdir: dumpdir
		})

		let dir = await fsp.readdir(`${dumpdir}/2021/02`, { withFileTypes: true })
		expect(dir.length).toBe(8)
		dir = await fsp.readdir(`${dumpdir}/2021/03`, { withFileTypes: true })
		expect(dir.length).toBe(4)
	})

	test("parse creates correct MD structure", async () => {
		await parseMastoFeed({
			url: "invalid",
			notesdir: dumpdir
		})

		const actualMd = (await fsp.readFile(`${dumpdir}/2021/03/01h19m3s35.md`)).toString()
		expect(actualMd).toMatchSnapshot()
	})

	test("parse creates MD with context if in-reply-to", async () => {
		//https://aus.social/users/aussocialadmin/statuses/105817435308293091
		await parseMastoFeed({
			url: "invalid",
			notesdir: dumpdir
		})

		const actualMd = await fsp.readFile(`${dumpdir}/2021/03/02h16m18s46.md`)
		const expectedReplyTo = "https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793"

		const md = frontMatterParser.parseSync(actualMd.toString())
		expect(md.data.context).toBe(expectedReplyTo)
	})
})
