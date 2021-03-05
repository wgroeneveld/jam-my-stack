
jest.mock('got');
const gotmock = require("got");

test("got is mocked", async () => {
	const data = await gotmock("bla");
	expect(data).toMatch(/brainbaking/)
})
