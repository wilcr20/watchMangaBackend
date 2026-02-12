const express = require("express");
const router = express.Router();

const manwhaLatinoController = require("../controllers/manga/manwhaLatinoController");

router.get("/home", manwhaLatinoController.home);
router.get("/trends", manwhaLatinoController.trends);
router.post("/search", manwhaLatinoController.search);
router.post("/mangaInfo", manwhaLatinoController.mangaInfo);
router.post("/searchByGenre", manwhaLatinoController.searchByGenre);


module.exports = router;
