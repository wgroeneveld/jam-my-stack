
describe("mastodon feed parser tests", () => {
	const fs = require('fs');
	const fsp = require('fs').promises;
	const { rmdir } = require('./../utils')

	const frontMatterParser = require('parser-front-matter');

	jest.mock('got');

	const { parseMastoFeed } = require('../../src/mastodon/feed-parser')
	const dumpdir = `${__dirname}/dump`

	beforeEach(() => {
		if(fs.existsSync(dumpdir)) {
			rmdir(dumpdir)
		}
		fs.mkdirSync(dumpdir)
	});

	describe("ignore replies option", () => {
		test("ignore replies if ignoreReplies is set to true", async () => {
			await parseMastoFeed({
				url: "masto-feed-with-replies",
				notesdir: dumpdir,
				ignoreReplies: true
			})

			dir = await fsp.readdir(`${dumpdir}/2021/03`, { withFileTypes: true })
			expect(dir.length).toBe(1)		
		})
		test("does not ignore replies if ignoreReplies is set to false", async () => {
			await parseMastoFeed({
				url: "masto-feed-with-replies",
				notesdir: dumpdir,
				ignoreReplies: false
			})

			dir = await fsp.readdir(`${dumpdir}/2021/03`, { withFileTypes: true })
			expect(dir.length).toBe(2)		
		})
	})

	test("parse embedded images", async () => {
		await parseMastoFeed({
			url: "masto-feed-images",
			notesdir: dumpdir,
			utcOffset: 1
		})

		const actualMd = (await fsp.readFile(`${dumpdir}/2021/03/14h17m41s53.md`)).toString()
		expect(actualMd).toMatchSnapshot()
	})

	test("parse prepends double quotes with backlash to escape in frontmatter", async () => {
		await parseMastoFeed({
			url: "masto-feed-quote",
			notesdir: dumpdir,
			utcOffset: 0
		})

		const actualMd = await fsp.readFile(`${dumpdir}/2021/03/02h16m18s46.md`)
		
		const md = frontMatterParser.parseSync(actualMd.toString())
		expect(md.data.title).toBe("\"wow this sucks\" with quotes")
	})

	test("parse trims title according to config and adds three dots", async () => {
		await parseMastoFeed({
			url: "masto-feed-sample",
			notesdir: dumpdir,
			utcOffset: 0,
			titleCount: 5,
			titlePrefix: "Note: "
		})

		const actualMd = await fsp.readFile(`${dumpdir}/2021/03/02h16m18s46.md`)
		
		const md = frontMatterParser.parseSync(actualMd.toString())
		expect(md.data.title).toBe("Note: @Stam...")
	})

	test("parse does not trim if titleCount > title length and does not add three dots", async () => {
		await parseMastoFeed({
			url: "masto-feed-sample",
			notesdir: dumpdir,
			utcOffset: 0,
			titleCount: 5000
		})

		const actualMd = await fsp.readFile(`${dumpdir}/2021/03/02h16m18s46.md`)
		
		const md = frontMatterParser.parseSync(actualMd.toString())
		expect(md.data.title).toBe("@StampedingLonghorn I tried to chase him away, but you know how that turned out... 😼 There's ...")
	})

	test("parse creates separate notes in each month subdir", async () => {
		await parseMastoFeed({
			url: "masto-feed-sample",
			notesdir: dumpdir
		})

		let dir = await fsp.readdir(`${dumpdir}/2021/02`, { withFileTypes: true })
		expect(dir.length).toBe(8)
		dir = await fsp.readdir(`${dumpdir}/2021/03`, { withFileTypes: true })
		expect(dir.length).toBe(4)
	})

	test("parse creates correct MD structure", async () => {
		await parseMastoFeed({
			url: "masto-feed-sample",
			notesdir: dumpdir,
			utcOffset: 0,
			titleCount: 5000			
		})

		const actualMd = (await fsp.readFile(`${dumpdir}/2021/03/01h19m03s35.md`)).toString()
		expect(actualMd).toMatchSnapshot()
	})

	test("parse creates MD with context if in-reply-to", async () => {
		//https://aus.social/users/aussocialadmin/statuses/105817435308293091
		await parseMastoFeed({
			url: "masto-feed-sample",
			notesdir: dumpdir,
			utcOffset: 0,
			titleCount: 5000			
		})

		const actualMd = await fsp.readFile(`${dumpdir}/2021/03/02h16m18s46.md`)
		const expectedReplyTo = "https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793"

		const md = frontMatterParser.parseSync(actualMd.toString())
		expect(md.data.context).toBe(expectedReplyTo)
	})
})
