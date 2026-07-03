const express = require("express");
const router = express.Router();

const tioAnimeController = require("../../controllers/anime/tioanime/tioAnimeController");

router.get("/home", tioAnimeController.home);
router.post("/search", tioAnimeController.search);
router.post("/getAnimeInfo", tioAnimeController.getAnimeInfo);
router.post("/SeeChapter", tioAnimeController.SeeChapter);
router.post("/filterSearch", tioAnimeController.filterSearch);

module.exports = router;
