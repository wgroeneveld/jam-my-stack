
const MockDate = require('mockdate')
const dayjs = require('dayjs')

describe("webmention receive serve-my-jam tests", () => {

	const { getWebmentions } = require('./../../src/webmention/get')
	MockDate.set(dayjs('2021-03-11T19:00:00').toDate())

	test("getWebmentions fetches from serve-my-jam depending on config", async () => {
		const result = await getWebmentions()
		expect(result.length).toBe(4)
	})

	test("getWebmentions enriches data with fromNow data", async () => {
		const result = await getWebmentions()
		const mention = result[0]

		expect(mention.published).toEqual("2021-03-08T18:35:24")
		expect(mention.publishedFromNow).toEqual("3 days ago")
	})

	test("getWebmentions are sorted by published date descending", async() => {
		const result = await getWebmentions()

		expect(result[0].published).toEqual("2021-03-08T18:35:24")
		expect(result[1].published).toEqual("2021-03-08T17:14:25")
		expect(result[2].published).toEqual("2021-03-02T16:18:46.000Z")
	})

})
