
const stubimg = "https://brainbaking.com//img/avatar.jpg"

function youtubedl(url, options) {
	return new Promise(function(resolve, reject) {
		if(url.indexOf("exception") >= 0) {
			console.log("STUB exception wanted, here you go ==>")
			reject("BOOM")
		}
		
		resolve(stubimg)
	})
}

module.exports = youtubedl
