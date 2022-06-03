const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumSchema = new Schema({
  wrapperType: String, 
  collectionType: String, 
  artistId: Number, 
  collectionId: Number, 
  amgArtistId: Number, 
  artistName: String, 
  collectionName: String, 
  collectionCensoredName: String, 
  artistViewUrl: String, 
  collectionViewUrl: String, 
  artworkUrl60: String, 
  artworkUrl100: String, 
  collectionPrice: Number, 
  collectionExplicitness: String, 
  trackCount: Number, 
  copyright: String, 
  country: String, 
  currency: String, 
  releaseDate: String, 
  primaryGenreName: String
});

module.exports = mongoose.model('Album', albumSchema);
