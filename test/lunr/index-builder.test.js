const { buildIndex } = require('../../src/lunr/index-builder')

let result = null

beforeEach(async () => {
	result = await buildIndex([
		`${__dirname}/postsstub1`,
		`${__dirname}/postsstub2`])
})

test('lunr inverted index stuffed with loads of goodies from both dirs', async() => {
	expect(result.invertedIndex.cool).not.toBe(undefined)
	expect(result.invertedIndex.gravediggaz).not.toBe(undefined)
	expect(result.invertedIndex.wu).not.toBe(undefined)
	expect(result.invertedIndex.tang).not.toBe(undefined)
	expect(result.invertedIndex.east).not.toBe(undefined)
	expect(result.invertedIndex.side).not.toBe(undefined)
})

test('lunr index builder fields are title, content, tags', async () => {	
	// Do not forget to add JSON.Stringify() when calling this in production
	expect(result.fields).toEqual(["title", "content", "tags"])
})

