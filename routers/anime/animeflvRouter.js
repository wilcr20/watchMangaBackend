const express = require("express");
const router = express.Router();

const animeflvController = require("../../controllers/anime/animeFlvController");

router.get("/home", animeflvController.home);
router.post("/search", animeflvController.search);
router.post("/getAnimeInfo", animeflvController.getAnimeInfo);
router.post("/SeeChapter", animeflvController.SeeChapter);
router.post("/filterSearch", animeflvController.filterSearch);
router.post("/movies", animeflvController.movies);

module.exports = router;
