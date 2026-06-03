const express = require("express");
const router = express.Router();

const animeytController = require("../../controllers/anime/animeyt/animeytController");

router.get("/home", animeytController.home);
router.post("/getAnimeInfo", animeytController.getAnimeInfo);
router.post("/SeeChapter", animeytController.SeeChapter);
router.post("/search", animeytController.search);
router.post("/directory", animeytController.directory)

router.post("/filterSearch", animeytController.filterSearch);



module.exports = router;
