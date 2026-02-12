const express = require("express");
const router = express.Router();

const latanimeController = require("../../controllers/anime/latanime/latanimeController");

router.get("/home", latanimeController.home);
router.post("/search", latanimeController.search);
router.post("/getAnimeInfo", latanimeController.getAnimeInfo);
router.post("/SeeChapter", latanimeController.SeeChapter);
router.post("/filterSearch", latanimeController.filterSearch);



module.exports = router;
