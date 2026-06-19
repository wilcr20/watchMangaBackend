const express = require("express");
const router = express.Router();

const animeflvArController = require("../../controllers/anime/animeflv.ar/animeFlvArController");

router.get("/home", animeflvArController.home);
router.post("/search", animeflvArController.search);
router.post("/getAnimeInfo", animeflvArController.getAnimeInfo);
router.post("/SeeChapter", animeflvArController.SeeChapter);
router.post("/filterSearch", animeflvArController.filterSearch);

module.exports = router;
