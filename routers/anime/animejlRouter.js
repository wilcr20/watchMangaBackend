const express = require("express");
const router = express.Router();

const animejlController = require("../../controllers/anime/animejl/animejlController");

router.get("/home", animejlController.home);
router.post("/search", animejlController.search);
router.post("/getAnimeInfo", animejlController.getAnimeInfo);
router.post("/SeeChapter", animejlController.SeeChapter);
router.post("/filterSearch", animejlController.filterSearch);


module.exports = router;
