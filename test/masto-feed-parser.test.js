const fs = require('fs');
const fsp = require('fs').promises;
const { rmdir } = require('./utils')

const frontMatterParser = require('parser-front-matter');

jest.mock('got');
const gotmock = require("got");

test("got is mocked", async () => {
	const data = await gotmock("bla");
	expect(data).toMatch(/brainbaking/)
})

const { parseMastoFeed } = require('../src/masto-feed-parser')

describe("mastodon feed parser tests", () => {
	beforeEach(() => {
		if(fs.existsSync("dump")) {
			rmdir("dump")
		}
		fs.mkdirSync("dump")
	});

	test("parse creates separate notes in each month subdir", async () => {
		await parseMastoFeed({
			url: "invalid",
			notesdir: "dump"
		})

		let dir = await fsp.readdir("dump/2021/02", { withFileTypes: true })
		expect(dir.length).toBe(8)
		dir = await fsp.readdir("dump/2021/03", { withFileTypes: true })
		expect(dir.length).toBe(4)
	})

	test("parse creates correct MD structure", async () => {
		await parseMastoFeed({
			url: "invalid",
			notesdir: "dump"
		})

		const actualMd = await fsp.readFile("dump/2021/03/01h20m3s35.md").toString()
		const expectedMd = await fsp.readFile("test/expected-01h20m3s35.md").toString()

		expect(actualMd).toEqual(expectedMd)
	})

	test("parse creates MD with context if in-reply-to", async () => {
		//https://aus.social/users/aussocialadmin/statuses/105817435308293091
		await parseMastoFeed({
			url: "invalid",
			notesdir: "dump"
		})

		const actualMd = await fsp.readFile("dump/2021/03/02h17m18s46.md")
		const expectedReplyTo = "https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793"

		const md = frontMatterParser.parseSync(actualMd.toString())
		expect(md.data.context).toBe(expectedReplyTo)
	})
})
