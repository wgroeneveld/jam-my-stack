const { thumbify } = require('../../src/youtube/thumbify.js')
const fs = require('fs');
const fsp = require('fs').promises;
const { rmdir } = require('./../utils')
const { getFiles } = require('../../src/file-utils');

const dumpdir = `${__dirname}/youtubeposts-stub`

jest.mock('youtube-dl-exec')
jest.disableAutomock()
jest.unmock('got')

beforeEach(async () => {
	if(fs.existsSync(dumpdir)) {
		rmdir(dumpdir)
	}
	fs.mkdirSync(dumpdir)
})

test('Posts without YouTube links downloads nothing', async () => {
	const md = `---
title: "wizardry 8 review"
---

here's a post

it doesn't contain a link, sorry...
`

	await fsp.writeFile(`${dumpdir}/post.md`, md, 'utf-8')
	await thumbify({
		postDir: dumpdir,
		downloadDir: dumpdir,
		overlayImg: `${__dirname}/play.png`
	})
	const output = await getFiles(dumpdir)
	expect(output.length).toBe(1)
})

test('Posts of which one youtube ID is invalid does carry on downloading the next', async () => {
	const md = `---
title: "wizardry 8 review"
---

here's a post

{{< youtube exception >}}

tsjek it out nog ene

{{< youtube OjKWKxYrUWs >}}

cool vid eh?
`

	await fsp.writeFile(`${dumpdir}/post.md`, md, 'utf-8')
	await thumbify({
		postDir: dumpdir,
		downloadDir: dumpdir,
		overlayImg: `${__dirname}/play.png`
	})
	const output = await getFiles(dumpdir)
	expect(output.length).toBe(2)
})

test('Posts with multiple YouTube links download all thumbs', async () => {
	const md = `---
title: "wizardry 8 review"
---

here's a post

{{< youtube 7L-rDDGpYs0 >}}

tsjek it out nog ene

{{< youtube OjKWKxYrUWs >}}

cool vid eh?
`

	await fsp.writeFile(`${dumpdir}/post.md`, md, 'utf-8')
	await thumbify({
		postDir: dumpdir,
		downloadDir: dumpdir,
		overlayImg: `${__dirname}/play.png`
	})
	const output = await getFiles(dumpdir)
	expect(output.length).toBe(3)
})

test('Posts with YouTube link in quotes downloads thumbs', async () => {
	const md = `---
title: "wizardry 8 review"
---

here's a post

{{< youtube "7L-rDDGpYs0" >}}

cool vid eh?
`

	await fsp.writeFile(`${dumpdir}/post.md`, md, 'utf-8')
	await thumbify({
		postDir: dumpdir,
		downloadDir: dumpdir,
		overlayImg: `${__dirname}/play.png`
	})
	const output = await getFiles(dumpdir)
	expect(output.length).toBe(2)
})