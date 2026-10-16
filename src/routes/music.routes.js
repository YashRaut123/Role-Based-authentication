const express = require('express');
const musicController = require('../controllers/music.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middlewares/auth.middleware');



const router = express.Router();

router.post('/upload', authMiddleware.authArtist, upload.single('music'), musicController.createMusic);
router.post('/album', authMiddleware.authArtist, musicController.createAlbum);

router.get('/',authMiddleware.authUser, musicController.getMusic);
router.get('/album', authMiddleware.authUser, musicController.getAlbum);

router.get("/album/:albumId", authMiddleware.authUser, musicController.getAlbumById);

module.exports = router;