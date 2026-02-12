const express = require("express");
const router = express.Router();

const lectorMangaLatController = require("../controllers/manga/lectorMangaLatController");

router.get("/home", lectorMangaLatController.home);
router.get("/trends", lectorMangaLatController.trends);
router.post("/search", lectorMangaLatController.search);
router.post("/mangaInfo", lectorMangaLatController.mangaInfo);
router.post("/searchByGenre", lectorMangaLatController.searchByGenre);


module.exports = router;
