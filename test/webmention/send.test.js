
describe("webmention send serve-my-jam tests", () => {

	const got = require('got')

	const { sendWebmentions } = require('./../../src/webmention/send')

	let calledPut = ""
	beforeEach(() => {
		got.put = function(url) {
			calledPut = url
		}
	});


	test("sendWebmentions", async() => {
		await sendWebmentions('brainbaking.com')
		expect(calledPut).toBe("https://jam.brainbaking.com/webmention/brainbaking.com/miauwkes")
	})

})
