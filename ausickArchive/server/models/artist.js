const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema({
    artistId: Number,
    artistName: String,
    bio: String,
    photo: String,
    founded: Number,
    hometown: String,
    members: String
});

module.exports = mongoose.model('Artist', artistSchema);
