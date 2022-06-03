const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
  wrapperType: String,
    kind: String,
    artistId: Number,
    collectionId: Number,
    trackId: Number,
    artistName: String,
    collectionName: String,
    trackName: String,
    collectionCensoredName: String,
    trackCensoredName: String,
    artistViewUrl: String,
    collectionViewUrl: String,
    trackViewUrl: String,
    previewUrl: String,
    artworkUrl30: String,
    artworkUrl60: String,
    artworkUrl100: String,
    collectionPrice: Number,
    trackPrice: Number,
    releaseDate: String,
    collectionExplicitness: String,
    trackExplicitness: String,
    discCount: Number,
    discNumber: Number,
    trackCount: Number,
    trackNumber: Number,
    trackTimeMillis: Number,
    country: String,
    currency: String,
    primaryGenreName: String,
    isStreamable: Number,
});

module.exports = mongoose.model('Song', songSchema);
