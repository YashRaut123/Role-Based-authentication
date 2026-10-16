const musicModel = require('../models/music.model');
const jwt = require('jsonwebtoken');
const {uploadFile} = require('../services/storage.service');
const albumModel = require('../models/album.model');


async function createMusic(req,res){
    
    
    const {title} = req.body
    const file = req.file
    const result = await uploadFile(file.buffer.toString('base64'))

    const music = await musicModel.create({
        uri:result.url,
        title,
        artist:req.user.id
    })
    res.status(201).json({
        message:"Music created successfully",
        music:{
            id:music._id,
            uri:music.uri,
            title:music.title,
            artist:music.artist
        }
    })

    
}

async function createAlbum(req,res){
   
        const {title,music} = req.body
        const album = await albumModel.create({
            title,
            artist:req.user.id,
            music:music
        })
        res.status(201).json({
            message:"Album created successfully",
            album:{
                id:album._id,
                title:album.title,
                artist:album.artist,
                music:album.music
            }
        })

    
}

async function getMusic(req,res){
    const music =await musicModel.find().limit(2).populate('artist')
    res.status(200).json({
        message:"Music retrieved successfully",
        music:music
    })
}

async function getAlbum(req,res){
    const album = await albumModel.find().select("title artist -music").populate('music').populate('artist',"username email")
    res.status(200).json({
        message:"Album retrieved successfully",
        album:album
    })
}

async function getAlbumById(req,res){
    const albumId = req.params.albumId
 
    const album = await albumModel.findById(albumId).populate('music').populate('artist',"username email")
    res.status(200).json({
        message:"Album retrieved successfully",
        album:album
    })
}

module.exports = {createMusic , createAlbum , getMusic , getAlbum , getAlbumById}