
jest.disableAutomock()
jest.unmock('got')

const { getWebmentions } = require('./../../src/webmention/get')
const domain = "brainbaking.com"

describe("webmention receive scenario test", () => {

	test("getWebmentions fetches anything at all", async () => {
		const result = await getWebmentions(domain)
		expect(result.length).toBeGreaterThan(-1)
	})

})
