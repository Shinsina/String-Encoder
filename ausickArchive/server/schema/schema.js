const graphql = require('graphql');
const Artist = require('../models/artist')
const Album = require('../models/album')
const Song = require('../models/song')


const {
    GraphQLObjectType, GraphQLString,
    GraphQLID, GraphQLInt,GraphQLSchema,
    GraphQLList,GraphQLNonNull, GraphQLFloat
} = graphql;

const ArtistType = new GraphQLObjectType({
  name: 'Artist',
  fields: () => ({
    id: { type: GraphQLID },
    artistId: { type: GraphQLInt },
    artistName: { type: GraphQLString },
    bio: { type: GraphQLString },
    photo: { type: GraphQLString },
    founded: { type: GraphQLInt },
    hometown: { type: GraphQLString },
    members: { type: GraphQLString },
    albums: {
      type: new GraphQLList(AlbumType),
      resolve(parent,args){
        return Album.find({artistId: parent.artistId})
      }
    },
    songs: {
      type: new GraphQLList(SongType),
      resolve(parent,args){
        return Song.find({artistId: parent.artistId})
      }
    }
  })
})

const AlbumType = new GraphQLObjectType({
  name: 'Album',
  fields: () => ({
    id: { type: GraphQLID },
    wrapperType: { type: GraphQLString },
    collectionType: { type: GraphQLString },
    artistId: { type: GraphQLInt },
    collectionId: { type: GraphQLInt },
    amgArtistId: { type: GraphQLInt },
    artistName: { type: GraphQLString },
    collectionName: { type: GraphQLString },
    collectionCensoredName: { type: GraphQLString },
    artistViewUrl: { type: GraphQLString },
    collectionViewUrl: { type: GraphQLString },
    artworkUrl60: { type: GraphQLString },
    artworkUrl100: { type: GraphQLString },
    collectionPrice: { type: GraphQLFloat },
    collectionExplicitness: { type: GraphQLString },
    trackCount: { type: GraphQLInt },
    copyright: { type: GraphQLString },
    country: { type: GraphQLString },
    currency: { type: GraphQLString },
    releaseDate: { type: GraphQLString },
    primaryGenreName: { type: GraphQLString },
    songs:{
      type: new GraphQLList(SongType),
      resolve(parent,args){
          return Song.find({ collectionId: parent.collectionId });
      }
  }
  })
})

const SongType = new GraphQLObjectType ({
  name: 'Song',
  fields: () => ({
    id: { type: GraphQLID },
    wrapperType: { type: GraphQLString },
    kind: { type: GraphQLString },
    artistId: { type: GraphQLInt },
    collectionId: { type: GraphQLInt },
    trackId: { type: GraphQLInt },
    artistName: { type: GraphQLString },
    collectionName: { type: GraphQLString },
    trackName: { type: GraphQLString },
    collectionCensoredName: { type: GraphQLString },
    trackCensoredName: { type: GraphQLString },
    artistViewUrl: { type: GraphQLString },
    collectionViewUrl: { type: GraphQLString },
    trackViewUrl: { type: GraphQLString },
    previewUrl: { type: GraphQLString },
    artworkUrl30: { type: GraphQLString },
    artworkUrl60: { type: GraphQLString },
    artworkUrl100: { type: GraphQLString },
    collectionPrice: { type: GraphQLFloat },
    trackPrice: { type: GraphQLFloat },
    releaseDate: { type: GraphQLString },
    collectionExplicitness: { type: GraphQLString },
    trackExplicitness: { type: GraphQLString },
    discCount: { type: GraphQLInt },
    discNumber: { type: GraphQLInt },
    trackCount: { type: GraphQLInt },
    trackNumber: { type: GraphQLInt },
    trackTimeMillis: {type: GraphQLInt },
    country: { type: GraphQLString },
    currency: { type: GraphQLString },
    primaryGenreName: { type: GraphQLString },
    isStreamable: { type: graphql.GraphQLBoolean },
    album:{
      type: AlbumType,
      resolve(parent,args){
          return Album.findOne({ collectionId: parent.collectionId })
      }
  }
  })
})
//RootQuery describe how users can use the graph and grab data.
//E.g Root query to get all authors, get all books, get a particular
//book or get a particular author.
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        artist: {
          type: ArtistType,
          args: { id: { type: GraphQLID }},
          resolve(parent, args){
            return Artist.findById(args.id);
          }
        },
        artists: {
          type: new GraphQLList(ArtistType),
          resolve(parent, args) {
            return Artist.find({})
          }
        },
        album: {
          type: AlbumType,
          args: { id: { type: GraphQLID }},
          resolve(parent, args) {
            return Album.findById(args.id);
          }
        },
        albums: {
          type: new GraphQLList(AlbumType),
          resolve(parent, args) {
            return Album.find({})
          }
        },
        song: {
          type: SongType,
          args: { id: { type: GraphQLID }},
          resolve(parent, args) {
            return Song.findById(args.id);
          }
        },
        songs: {
          type: new GraphQLList(SongType),
          resolve(parent, args){
            return Song.find({})
          }
        }
    }
});

//Very similar to RootQuery helps user to add/update to the database.
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addArtist: {
          type: ArtistType,
          args: {
            artistId: { type: GraphQLInt },
            artistName: { type: GraphQLString },
            bio: { type: GraphQLString },
            photo: { type: GraphQLString },
            founded: { type: GraphQLInt },
            hometown: { type: GraphQLString },
            members: { type: GraphQLString },
          },
          resolve(parent,args){
            let artist = new Artist({
              artistId: args.artistId,
              artistName: args.artistName,
              bio: args.bio,
              photo: args.photo,
              founded: args.founded,
              hometown: args.hometown,
              members: args.members,
            });
            return artist.save();
          }
        },
        updateArtist: {
          type: ArtistType,
          args: {
            id: { type: GraphQLID },
            bio: { type: GraphQLString },
            photo: { type: GraphQLString },
            members: { type: GraphQLString },
          },
          resolve(parent,args){
            return new Promise((resolve, reject) => {
              Artist.findOneAndUpdate(
                {"_id": args.id},
                {"$set":{bio: args.bio, photo: args.photo, members: args.members}},
                {"new": true} //return new document
                ).exec((err,res)=> {
                  if(err) {
                    console.log(err)
                  } else {
                    resolve(res)
                  }
                })
            })
          }
        },
        deleteArtist: {
          type: ArtistType,
          args: {
            id: { type: GraphQLID }
          },
          resolve(parent,args){
            return Artist.findByIdAndDelete(args.id)
          }
        },
        addAlbum: {
          type: AlbumType,
          args: {
            wrapperType: { type: new GraphQLNonNull(GraphQLString) },
            collectionType: { type: new GraphQLNonNull(GraphQLString) },
            artistId: { type: new GraphQLNonNull(GraphQLInt) },
            collectionId: { type: new GraphQLNonNull(GraphQLInt) },
            amgArtistId: { type: new GraphQLNonNull(GraphQLInt) },
            artistName: { type: new GraphQLNonNull(GraphQLString) },
            collectionName: { type: new GraphQLNonNull(GraphQLString) },
            collectionCensoredName: { type: new GraphQLNonNull(GraphQLString) },
            artistViewUrl: { type: new GraphQLNonNull(GraphQLString) },
            collectionViewUrl: { type: new GraphQLNonNull(GraphQLString) },
            artworkUrl60: { type: new GraphQLNonNull(GraphQLString) },
            artworkUrl100: { type: new GraphQLNonNull(GraphQLString) },
            collectionPrice: { type: new GraphQLNonNull(GraphQLFloat) },
            collectionExplicitness: { type: new GraphQLNonNull(GraphQLString) },
            trackCount: { type: new GraphQLNonNull(GraphQLInt) },
            copyright: { type: new GraphQLNonNull(GraphQLString) },
            country: { type: new GraphQLNonNull(GraphQLString) },
            currency: { type: new GraphQLNonNull(GraphQLString) },
            releaseDate: { type: new GraphQLNonNull(GraphQLString) },
            primaryGenreName: { type: new GraphQLNonNull(GraphQLString) }
          },
          resolve(parent, args) {
            let album = new Album({
              wrapperType: args.wrapperType,
              collectionType: args.collectionType,
              artistId: args.artistId,
              collectionId: args.collectionId,
              amgArtistId: args.amgArtistId,
              artistName: args.artistName,
              collectionName: args.collectionName,
              collectionCensoredName: args.collectionCensoredName,
              artistViewUrl: args.artistViewUrl,
              collectionViewUrl: args.collectionViewUrl,
              artworkUrl60: args.artworkUrl60,
              artworkUrl100: args.artworkUrl100,
              collectionPrice: args.collectionPrice,
              collectionExplicitness: args.collectionExplicitness,
              trackCount: args.trackCount,
              copyright: args.copyright,
              country: args.country,
              currency: args.currency,
              releaseDate: args.releaseDate,
              primaryGenreName: args.primaryGenreName
            });
            return album.save();
          }
        },
        updateAlbum: {
          type: AlbumType,
          args: {
            id: { type: GraphQLID },
            collectionPrice: { type: new GraphQLNonNull(GraphQLFloat) },
          },
          resolve(parent,args){
            return new Promise((resolve, reject) => {
              Album.findOneAndUpdate(
                {"_id": args.id},
                {"$set":{collectionPrice: args.collectionPrice}},
                {"new": true} //return new document
                ).exec((err,res)=> {
                  if(err) {
                    console.log(err)
                  } else {
                    resolve(res)
                  }
                })
            })
          }
        },
        deleteAlbum: {
          type: AlbumType,
          args: {
            id: { type: GraphQLID },
          },
          resolve(parent,args){
            return Album.findByIdAndDelete(args.id)
          }
        },
        deleteAlbums: {
          type: AlbumType,
          args: {
            artistId: { type: GraphQLInt }
          },
          resolve(parent,args){
            return Album.deleteMany({artistId: args.artistId})
          }
        },
        addSong: {
          type: SongType,
          args: {
              wrapperType: { type: GraphQLString },
              kind: { type: GraphQLString },
              artistId: { type: GraphQLInt },
              collectionId: { type: GraphQLInt },
              trackId: { type: GraphQLInt },
              artistName: { type: GraphQLString },
              collectionName: { type: GraphQLString },
              trackName: { type: GraphQLString },
              collectionCensoredName: { type: GraphQLString },
              trackCensoredName: { type: GraphQLString },
              artistViewUrl: { type: GraphQLString },
              collectionViewUrl: { type: GraphQLString },
              trackViewUrl: { type: GraphQLString },
              previewUrl: { type: GraphQLString },
              artworkUrl30: { type: GraphQLString },
              artworkUrl60: { type: GraphQLString },
              artworkUrl100: { type: GraphQLString },
              collectionPrice: { type: GraphQLFloat },
              trackPrice: { type: GraphQLFloat },
              releaseDate: { type: GraphQLString },
              collectionExplicitness: { type: GraphQLString },
              trackExplicitness: { type: GraphQLString },
              discCount: { type: GraphQLInt },
              discNumber: { type: GraphQLInt },
              trackCount: { type: GraphQLInt },
              trackNumber: { type: GraphQLInt },
              trackTimeMillis: {type: GraphQLInt },
              country: { type: GraphQLString },
              currency: { type: GraphQLString },
              primaryGenreName: { type: GraphQLString },
              isStreamable: { type: graphql.GraphQLBoolean },
          },
          resolve(parent, args) {
            let song = new Song({
              wrapperType: args.wrapperType,
              kind: args.kind,
              artistId: args.artistId,
              collectionId: args.collectionId,
              trackId: args.trackId,
              artistName: args.artistName,
              collectionName: args.collectionName,
              trackName: args.trackName,
              collectionCensoredName: args.collectionCensoredName,
              trackCensoredName: args.trackCensoredName,
              artistViewUrl: args.artistViewUrl,
              collectionViewUrl: args.collectionViewUrl,
              trackViewUrl: args.trackViewUrl,
              previewUrl: args.previewUrl,
              artworkUrl30: args.artworkUrl30,
              artworkUrl60: args.artworkUrl60,
              artworkUrl100: args.artworkUrl100,
              collectionPrice: args.collectionPrice,
              trackPrice: args.trackPrice,
              releaseDate: args.releaseDate,
              collectionExplicitness: args.collectionExplicitness,
              trackExplicitness: args.trackExplicitness,
              discCount: args.discCount,
              discNumber: args.discNumber,
              trackCount: args.trackCount,
              trackNumber: args.trackNumber,
              trackTimeMillis: args.trackTimeMillis,
              country: args.country,
              currency: args.currency,
              primaryGenreName: args.primaryGenreName,
              isStreamable: args.isStreamable,
            });
            return song.save();
          },
        },
        updateSong: {
          type: SongType,
        args: {
          id: { type: GraphQLID },
          trackPrice: { type: new GraphQLNonNull(GraphQLFloat) },
        },
        resolve(parent,args){
          return new Promise((resolve, reject) => {
            Song.findOneAndUpdate(
              {"_id": args.id},
              {"$set":{trackPrice: args.trackPrice}},
              {"new": true} //return new document
              ).exec((err,res)=> {
                if(err) {
                  console.log(err)
                } else {
                  resolve(res)
                }
              })
          })
        }
        },
        deleteSong: {
          type: SongType,
          args: {
            id: { type: GraphQLID },
          },
          resolve(parent,args){
            return Song.findByIdAndDelete(args.id)
          }
        },
        deleteSongs: {
          type: SongType,
          args: {
            artistId: { type: GraphQLInt }
          },
          resolve(parent,args){
            return Song.deleteMany({artistId: args.artistId})
          }
        },
        deleteSongsOnAlbum: {
          type: SongType,
          args: {
            collectionId: { type: GraphQLInt }
          },
          resolve(parent,args) {
            return Song.deleteMany({collectionId: args.collectionId})
          }
        }
    }
});

//Creating a new GraphQL Schema, with options query which defines query
//we will allow users to use when they are making request.
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation:Mutation
});
