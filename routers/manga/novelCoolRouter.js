const express = require("express");
const router = express.Router();

const novelCoolController = require("../../controllers/manga/novelCoolController");

router.get("/home", novelCoolController.home);
router.get("/trends", novelCoolController.trends);
router.post("/search", novelCoolController.search);
router.post("/mangaInfo", novelCoolController.mangaInfo);
router.post("/searchByGenre", novelCoolController.searchByGenre);


module.exports = router;
