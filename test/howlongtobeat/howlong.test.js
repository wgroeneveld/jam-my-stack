jest.mock('howlongtobeat')

const { howlong } = require('../../src/howlongtobeat/howlong.js')
const fs = require('fs');
const fsp = require('fs').promises;
const { rmdir } = require('./../utils')

const mdsample = `---
title: "wizardry 8 review"
game_name: "Wizardry 8"
---

blabla nice one 9/10 GG!
`

const dumpdir = `${__dirname}/howlong-stub`
beforeEach(async () => {
	if(fs.existsSync(dumpdir)) {
		rmdir(dumpdir)
	}
	fs.mkdirSync(dumpdir)

	await fsp.writeFile(`${dumpdir}/howlongtobeat-sample.md`, mdsample, 'utf-8')
})

test('howlong adds howlong to beat id and hours to frontmatter', async () => {
	await howlong(dumpdir)

	const actualmd = await fsp.readFile(`${dumpdir}/howlongtobeat-sample.md`, 'utf-8')
	expect(actualmd).toMatchSnapshot()
})
