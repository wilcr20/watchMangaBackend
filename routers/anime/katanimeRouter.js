const express = require("express");
const router = express.Router();

const katanimeController = require("../../controllers/anime/katanime/katanimeController");

router.get("/home", katanimeController.home);
router.post("/search", katanimeController.search);
router.post("/getAnimeInfo", katanimeController.getAnimeInfo);
router.post("/SeeChapter", katanimeController.SeeChapter);
router.post("/filterSearch", katanimeController.filterSearch);

module.exports = router;
