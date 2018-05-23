/**
 * Download a file.
 *
 * @return {Object} the latest update
 */

const crypto = require('crypto');
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const { PassThrough } = require('stream')
const download = require('download');
const decompress = require('decompress');
const mime = require('mime-types');

module.exports = async function ({
  url, dest
}) {
  const { base, ext } = path.parse(url);
  const filePath = `${dest}/${base}`;
  await fse.ensureFile(filePath);
  const digester = crypto.createHash('md5');

  // Creates an md5 hash of a stream's contents
  const digestStream = new PassThrough();
  digestStream.on('data', chunk => {
    digester.update(chunk);
  });

  return new Promise(async (resolve, reject) => {
    // Memory constraints are a real concern here. Using 
    // `download({ decompress: true })` stores everything in memory which is 
    // very inefficient.
    //
    // `download` returns a duplex stream so we can pipe to a writebale stream
    // to drastically cut down on memory footprint.
    //
    // Decompressing files can be done using streams theoretically. Many of 
    // decompress' plugins accept streams but decompress itself does not.
    // See: https://github.com/kevva/decompress/issues/29
    //
    // For now we download the archive and then decompress.
    if (['.zip', '.gz', '.xz', '.tar', '.bz2'].includes(ext)) {
      await download(url).pipe(fs.createWriteStream(filePath)).on('finish', async () => {
        await decompress(filePath, dest, {
          strip: 1
        }).catch(e => reject(e));
        fse.removeSync(filePath);
        resolve(digester.digest('hex'))
      })
      .on('error', e => reject(e));
    } else {
      download(url).pipe(digestStream).pipe(fs.createWriteStream(filePath))
        .on('finish', () => resolve(digester.digest('hex')))
        .on('error', e => reject(e))
    }
  });
};
