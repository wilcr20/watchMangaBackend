const express = require("express");
const router = express.Router();

const animeytController = require("../controllers/animeytController");

router.get("/home", animeytController.home);
router.get("/homeSeeMore", animeytController.homeSeeMore);
router.post("/getAnimeInfo", animeytController.getAnimeInfo);
router.post("/SeeChapter", animeytController.SeeChapter);
router.post("/search", animeytController.search);
router.get("/recomendation", animeytController.recomendation);
router.get("/ongoing", animeytController.ongoing);
router.post("/directory", animeytController.directory)
router.post("/directoryLatin", animeytController.directoryLatin)

module.exports = router;
