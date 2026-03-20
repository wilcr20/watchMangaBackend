const express = require("express");
const router = express.Router();

const animeav1Controller = require("../../controllers/anime/animeav1/animeav1Controller");

router.get("/home", animeav1Controller.home);
router.post("/search", animeav1Controller.search);
router.post("/getAnimeInfo", animeav1Controller.getAnimeInfo);
router.post("/SeeChapter", animeav1Controller.SeeChapter);
router.post("/filterSearch", animeav1Controller.filterSearch);


module.exports = router;
