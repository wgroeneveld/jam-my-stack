const youtubedl = require('youtube-dl-exec');
const got = require("got");
const { createWriteStream, existsSync, unlinkSync } = require("fs");
const fs = require('fs').promises;
const { getFiles } = require('./../file-utils');
var im = require("imagemagick"); 

async function downloadThumbnail(youtubeid, downloadDir, overlayImg) {
  const dlLoc = `${downloadDir}/${youtubeid}.jpg`
  if(existsSync(dlLoc)) {
    console.log(` -- SKIPPING ${youtubeid}: already downloaded.`)
    return
  }

  console.log(` -- downloading YouTube ${youtubeid} thumb...`)
  const fStream = createWriteStream(dlLoc)


  const done = new Promise(function(resolve, reject) {
    fStream.on('finish', () => {
      var args = [
        "-resize", "700x400", dlLoc,
        "+repage", "+page", overlayImg, "-flatten", dlLoc
      ]
      im.convert(args, function(err) {
        if(err) reject(err)
        resolve()
      })
    })

    youtubedl(`https://www.youtube.com/watch?v=${youtubeid}`, {
      getThumb: true,
      noWarnings: true
    })
    .then(url => {
      got.stream(url).pipe(fStream)
    })
    .catch(err => {
      // What the fuck. destroy() does not release: https://github.com/nodejs/node/issues/31776
      fStream.end()
      fStream.destroy()
      fStream.on('close', () => {
        if(existsSync(dlLoc)) unlinkSync(dlLoc)
        reject(err)
      })
    })
  })
  
  return done
}

async function loadPostsWithVideos(postsDirectoryPath) {
  const postNames = await getFiles(postsDirectoryPath);
  const posts = await Promise.all(
    postNames.filter(name => name.endsWith('.md')).map(async fileName => {
      const fileContent = await fs.readFile(fileName, 'utf8');
      return {
        file: fileName,
        content: fileContent
      }
    })
  );
  return posts
}

async function run(options) {
  const { postDir, downloadDir, overlayImg } = options
  console.log(`-- Scanning for YouTube embeds in ${postDir}... --`)

  const posts = await loadPostsWithVideos(postDir)
  for(let post of posts) {
    const matches = post.content.matchAll(/\{\{\<\syoutube\s\"?(.+)\"?\s\>\}\}/gi)
    for(let youtubeid of matches) {
      try {
          await downloadThumbnail(youtubeid[1].replace(/\"/g, ""), downloadDir, overlayImg)
      } catch(e) {
        console.log(`-- error while processing: ${e}`)
      } 
    }
  }
  console.log("-- DONE scanning for YouTube embeds --")  
}

module.exports = {
  thumbify: run
}
