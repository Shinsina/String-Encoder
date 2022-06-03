const axios = require('axios')
const fs = require('fs')

const DataBaseConnection = 'http://localhost:3000/graphql'
const cleanData = fs.readFileSync('Artists.json', { encoding: 'utf-8'})
let music = JSON.parse(cleanData)
//Album Uploader Function
async function putAlbum(album) {
  try {
    const res = await axios.post(DataBaseConnection, { query: `mutation { addAlbum(wrapperType: "${album.wrapperType}" collectionType: "${album.collectionType}" artistId: ${album.artistId} collectionId: ${album.collectionId} amgArtistId: ${album.amgArtistId} artistName: "${album.artistName}" collectionName: "${album.collectionName}" collectionCensoredName: "${album.collectionCensoredName}" artistViewUrl: "${album.artistViewUrl}" collectionViewUrl: "${album.collectionViewUrl}" artworkUrl60: "${album.artworkUrl60}" artworkUrl100: "${album.artworkUrl100}" collectionPrice: ${album.collectionPrice} collectionExplicitness: "${album.collectionExplicitness}" trackCount: ${album.trackCount} copyright: "${album.copyright}" country: "${album.country}" currency: "${album.currency}" releaseDate: "${album.releaseDate}" primaryGenreName: "${album.primaryGenreName}") {wrapperType collectionType artistId collectionId amgArtistId artistName collectionName collectionCensoredName artistViewUrl collectionViewUrl artworkUrl60 artworkUrl100 collectionPrice collectionExplicitness trackCount copyright country currency releaseDate primaryGenreName} }` })
  } catch(e) {
    console.log('err', e)
  }
}
/*music.results.forEach(album => {
  putRequest(album)
})*/

//Song Uploader Function
async function putSong(song) {
  try {
  const res = await axios.post(DataBaseConnection, { query: `mutation { addSong(wrapperType: "${song.wrapperType}" kind: "${song.kind}" artistId: ${song.artistId} collectionId: ${song.collectionId} trackId: ${song.trackId} artistName: "${song.artistName}" collectionName: "${song.collectionName}" trackName: "${song.trackName}" collectionCensoredName: "${song.collectionCensoredName}" trackCensoredName: "${song.trackCensoredName}" artistViewUrl: "${song.artistViewUrl}" collectionViewUrl: "${song.collectionViewUrl}" trackViewUrl: "${song.trackViewUrl}" previewUrl: "${song.previewUrl}" artworkUrl30: "${song.artworkUrl30}" artworkUrl60: "${song.artworkUrl60}" artworkUrl100: "${song.artworkUrl100}"  collectionPrice: ${song.collectionPrice} trackPrice: ${song.trackPrice} releaseDate: "${song.releaseDate}" collectionExplicitness: "${song.collectionExplicitness}" trackExplicitness: "${song.trackExplicitness}" discCount: ${song.discCount} discNumber: ${song.discNumber} trackCount: ${song.trackCount} trackNumber: ${song.trackNumber} trackTimeMillis: ${song.trackTimeMillis} country: "${song.country}" currency: "${song.currency}" primaryGenreName: "${song.primaryGenreName}" isStreamable: ${song.isStreamable}){wrapperType kind artistId collectionId trackId artistName collectionName trackName collectionCensoredName trackCensoredName artistViewUrl collectionViewUrl trackViewUrl previewUrl artworkUrl30 artworkUrl60 artworkUrl100 collectionPrice trackPrice releaseDate collectionExplicitness trackExplicitness discCount discNumber trackCount trackNumber trackTimeMillis country currency primaryGenreName isStreamable} }` })
  } catch(e) {
    console.log('err', e)
  }
}
/*music.results.forEach(song => {
  pushRequest(song)
})*/

//Artist Uploader Function
async function putArtist(artist) {
  try {
    //console.log(artist.artistId)
  const res = await axios.post(DataBaseConnection, { query: `mutation { addArtist(artistId: ${artist.artistId} artistName: "${artist.artistName}" bio: "${artist.bio}" photo: "${artist.photo}" founded: ${artist.founded} hometown: "${artist.hometown}" members: "${artist.members}"){artistName bio photo hometown members} }` })
console.log(res.data.errors)
} catch(e) {
    console.log('err', e)
  }
}
/*music.results.forEach(artist => {
  placeRequest(artist)
  //console.log(artist)
})*/
