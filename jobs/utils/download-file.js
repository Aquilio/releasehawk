/**
 * Download a file.
 *
 * @return {Object} the latest update
 */

const path = require('path');
const download = require('download');
const mime = require('mime-types');

module.exports = function({
  url, dest
}) {
  const extension = path.extname(url);
  const options = {
    strip: 1,
    mode: '666',
    headers: {
      accept: mime.lookup(extension)
    }
  };
  if(['.zip', '.gz', '.tar', '.bz2'].includes(extension)) {
    options.extract = true;
  }
  return download(url, dest, options);
};
