const express = require("express");
const router = express.Router();

const animeytController = require("../controllers/animeytController");

router.get("/home", animeytController.home);
router.get("/homeSeeMore", animeytController.homeSeeMore);
router.post("/getAnimeInfo", animeytController.getAnimeInfo);
router.post("/SeeChapter", animeytController.SeeChapter);
router.post("/search", animeytController.search);

module.exports = router;
