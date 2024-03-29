const express = require("express");
const router = express.Router();

const animeflvController = require("../controllers/animeFlvController");

// router.get("/home", lectortmoController.home);
router.post("/search", animeflvController.search);
router.post("/getAnimeInfo", animeflvController.getAnimeInfo);
router.post("/SeeChapter", animeflvController.SeeChapter);
router.post("/filterSearch", animeflvController.filterSearch);
router.post("/movies", animeflvController.movies);

module.exports = router;
