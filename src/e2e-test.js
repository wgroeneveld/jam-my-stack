

const jam = require('./index.js')

const dir = "/Users/wgroeneveld/development/jefklakscodex"

console.log('e2e test...');

jam.howlongtobeat.howlong({
		postDir: `${dir}/content/games`,
		downloadDir: `${dir}/static/img/hltb`
})

/*

const hltb = require('howlongtobeat');
(async function() {
	const hltbService = new hltb.HowLongToBeatService()
	const results = await hltbService.search("Arcanum")

	console.log(results)
})()
*/