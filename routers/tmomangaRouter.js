const express = require("express");
const router = express.Router();

const tmomangaController = require("../controllers/tmomangaController");

router.get("/home", tmomangaController.home);
router.get("/trends", tmomangaController.trends);
router.post("/search", tmomangaController.search);
router.post("/mangaInfo", tmomangaController.mangaInfo);
router.post("/searchByGenre", tmomangaController.searchByGenre);


module.exports = router;
