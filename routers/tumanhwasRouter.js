const express = require("express");
const router = express.Router();

const tumanhwasController = require("../controllers/tumanhwasController");

router.get("/home", tumanhwasController.home);
router.get("/trends", tumanhwasController.trends);
router.post("/search", tumanhwasController.search);
router.post("/mangaInfo", tumanhwasController.mangaInfo);
// router.post("/searchByGenre", tumanhwasController.searchByGenre);


module.exports = router;
