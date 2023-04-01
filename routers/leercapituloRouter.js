const express = require("express");
const router = express.Router();

const leercapituloController = require("../controllers/leercapituloController");

router.get("/home", leercapituloController.home);
router.get("/trends", leercapituloController.trends);
router.get("/search", leercapituloController.search);
router.post("/mangaInfo", leercapituloController.mangaInfo);
router.post("/searchByGenre", leercapituloController.searchByGenre);


module.exports = router;
