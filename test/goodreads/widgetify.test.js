
jest.mock('https')
const { widgetify } = require('../../src/goodreads/widgetify')

test("goodreads-widgetify changes from lowres to hires images", async () => {
	const result = await widgetify("fake")

	expect(result).toMatch(/_S400_.jpg/)
	expect(result).not.toMatch(/_SX/)
})
