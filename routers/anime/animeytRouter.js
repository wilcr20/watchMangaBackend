const express = require("express");
const router = express.Router();

const animeytController = require("../../controllers/anime/animeyt/animeytController");

router.get("/home", animeytController.home);
router.get("/homeSeeMore", animeytController.homeSeeMore);
router.post("/getAnimeInfo", animeytController.getAnimeInfo);
router.post("/SeeChapter", animeytController.SeeChapter);
router.post("/search", animeytController.search);
router.get("/ongoing", animeytController.ongoing);
router.post("/directory", animeytController.directory)
router.post("/directoryLatin", animeytController.directoryLatin)
router.post("/animesComingSoon", animeytController.animesComingSoon);

router.post("/filterSearch", animeytController.filterSearch);



module.exports = router;
