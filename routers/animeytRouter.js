const express = require("express");
const router = express.Router();

const animeytController = require("../controllers/animeytController");

router.get("/home", animeytController.home);
router.get("/homeSeeMore", animeytController.homeSeeMore);

// router.get("/trends", lectortmoController.trends);
// router.post("/search", lectortmoController.search);
// router.post("/mangaInfo", lectortmoController.mangaInfo);
// router.post("/searchByGenre", lectortmoController.searchByGenre);


module.exports = router;
