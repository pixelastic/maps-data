const curatedAuthors = require('../lib/curatedAuthors.js');
const imoen = require('imoen');
const _ = require('golgoth/lodash');
const CLOUDINARY_MAXIMUM_SIZE = 10485760;
/**
 * Custom method to enhance a record before saving it to disk
 * @param {object} record Record as extracted from reddinx
 * @returns {object} Updated record
 **/
module.exports = async (record) => {
  // Remove "Maps" from tags
  record.tags = _.map(record.tags, (tag) => {
    return tag.replace(' Map', '');
  });

  // Mark as curated
  const authorName = _.get(record, 'author.name');
  record.score.isCurated = _.includes(curatedAuthors, authorName);

  // Get preview metadata
  const previewUrl = record.picture.preview;

  // Image is too big for cloudinary, there is no point keeping it
  const filesize = await imoen.filesize(previewUrl);
  if (filesize >= CLOUDINARY_MAXIMUM_SIZE) {
    return false;
  }

  // Image has no dimensions (meaning it's missing)
  const { width, height } = await imoen.dimensions(previewUrl);
  if (!width || !height) {
    return false;
  }

  const lqip = await imoen.lqip(previewUrl);
  record.displayPicture = {
    url: previewUrl,
    width,
    height,
    placeholder: lqip,
  };

  return record;
};
