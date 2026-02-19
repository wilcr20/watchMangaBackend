const express = require("express");
const router = express.Router();

const jkanimeController = require("../../controllers/anime/jkanime/jkanimeController");

router.get("/home", jkanimeController.home);
router.post("/search", jkanimeController.search);
router.post("/getAnimeInfo", jkanimeController.getAnimeInfo);
router.post("/SeeChapter", jkanimeController.SeeChapter);
router.post("/filterSearch", jkanimeController.filterSearch);



module.exports = router;
