const express = require("express");
const router = express.Router();

const animeflvController = require("../controllers/animeFlvController");

// router.get("/home", lectortmoController.home);
// router.get("/trends", lectortmoController.trends);
router.post("/search", animeflvController.search);
router.post("/getAnimeInfo", animeflvController.getAnimeInfo);
router.post("/SeeChapter", animeflvController.SeeChapter);


module.exports = router;
