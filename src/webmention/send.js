
const got = require('got')
const config = require('../config')
const fsp = require('fs').promises

const dayjs = require('dayjs')

async function getSince(configfile) {
	let since = ''
	try {
		const fileContent = await fsp.readFile(configfile, 'utf8')
		since = JSON.parse(fileContent.toString()).since
	} catch(err) {
		// console.log(err)
		// we assume the file doesn't exist. See https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
	}
	return since	
}

async function updateSince(configfile) {
	const since = new Date().toISOString()
	await fsp.writeFile(configfile, JSON.stringify({ since }, null, 2), 'utf-8')
}

async function sendWebmentions(domain, configfile) {
	const since = await getSince(configfile)
	const url = `${config.serveMyJamEndpoint}/webmention/${domain}/${config.serveMyJamToken}?since=${since}`

	// this is an async call and will return 202 to say "started sending them out".
	const result = await got.put(url)
	await updateSince(configfile)
}

module.exports = {
	sendWebmentions	
}
