const express = require("express");
const router = express.Router();

const lectortmoController = require("../controllers/lectortmoController");

router.get("/home", lectortmoController.home);
router.get("/trends", lectortmoController.trends);
router.post("/search", lectortmoController.search);
router.post("/mangaInfo", lectortmoController.mangaInfo);
router.post("/searchByGenre", lectortmoController.searchByGenre);


module.exports = router;
