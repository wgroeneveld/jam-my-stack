const fs = require('fs').promises;
const { getFiles } = require('./file-utils');
const { promisify } = require('util');
const frontMatterParser = require('parser-front-matter');

const parse = promisify(frontMatterParser.parse.bind(frontMatterParser));


async function loadPostsWithFrontMatter(postsDirectoryPath) {
  const postNames = await getFiles(postsDirectoryPath);
  const posts = await Promise.all(
    // could be .DS_Store stuff found using recursive function above... 
    postNames.filter(name => name.endsWith('.md')).map(async fileName => {
      const fileContent = await fs.readFile(fileName, 'utf8');
      const {content, data} = await parse(fileContent);
      return {
        content: content.slice(0, 3000),
        ...data
      };
    })
  );
  return posts;
}

const lunrjs = require('lunr');

function makeIndex(posts) {
  return lunrjs(function() {
    this.ref('title');
    this.field('title');
    this.field('content');
    this.field('tags');
    posts.forEach(p => {
      this.add(p);
    });
  });
}

async function run(contentDirs) {
  const posts = await Promise.all(contentDirs.map(async (dir) => {
    return await loadPostsWithFrontMatter(dir)
  }))
  return makeIndex(posts.flat());
}

module.exports = {
  buildIndex: run
}
