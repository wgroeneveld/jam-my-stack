const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()

const { getFiles } = require('./../file-utils');
const fs = require('fs').promises;
const got = require("got");
const {promisify} = require('util');
const frontMatterParser = require('parser-front-matter');

const parse = promisify(frontMatterParser.parse.bind(frontMatterParser));

const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const { createWriteStream } = require("fs");

async function loadPostsWithFrontMatter(postsDirectoryPath) {
  const postNames = await getFiles(postsDirectoryPath);
  const posts = await Promise.all(
    // could be .DS_Store stuff found using recursive function above... 
    postNames.filter(name => name.endsWith('.md')).map(async fileName => {
      const fileContent = await fs.readFile(fileName, 'utf8');
      const {content, data} = await parse(fileContent);
      return {
        game: data.game_name,
        howlongtobeat_id: data.howlongtobeat_id,
        file: fileName
      }
    })
  );
  return posts;
}

async function downloadThumbnail(url, id, dir) {
  console.log(`   --- downloading thumbnail ${url} of id ${id}...`)
  await pipeline(
    got.stream(url),
    createWriteStream(`${dir}/${id}.jpg`)
  )
}

async function fillInHowLongToBeat(posts, downloadDir) {
  for(post of posts) {
    const results = await hltbService.search(post.game)

    if(results.length > 0) {
      const game = results[0]
      post.howlongtobeat = game.gameplayMain
      post.howlongtobeat_id = game.id

      if(downloadDir) {
        await downloadThumbnail(game.imageUrl, game.id, downloadDir)
      }
    }   
  }
}

async function run(options) {
  const { postDir, downloadDir } = options

  console.log(`-- SCANNING not yet processed articles in ${postDir} for game_name --`)
  let posts = await loadPostsWithFrontMatter(postDir)
  posts = posts.filter(post => post.game && !post.howlongtobeat_id)
  await fillInHowLongToBeat(posts, downloadDir)

  for(post of posts) {
    let data = await fs.readFile(post.file, 'utf8')
    data = data.replace(/game_name:/, `howlongtobeat_id: ${post.howlongtobeat_id}\nhowlongtobeat_hrs: ${post.howlongtobeat}\ngame_name:`)
    console.log(`\tFound game ${post.game}, how long filling in: ${post.howlongtobeat} (id #${post.howlongtobeat_id})`)
    await fs.writeFile(post.file, data, 'utf8')
  }

  console.log("-- DONE modifying files --")
}

module.exports = {
  howlong: run
}
