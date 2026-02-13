const express = require('express');

// manga
const leercapituloRuter = require("./routers/leercapituloRouter");
const tumanhwasRouter = require("./routers/tumanhwasRouter");
const tmomangaRouter = require("./routers/tmomangaRouter");
const lectortmoRouter = require("./routers/lectortmoRouter");
const lectorMangaLatRouter = require("./routers/lectorMangaLatRouter");
const manwhaLatinoRouter = require("./routers/manwhaLatinoRouter");

// anime
const animeflvRouter = require("./routers/anime/animeflvRouter");
const animeytRouter = require("./routers/anime/animeytRouter");
const latanimeRouter = require("./routers/anime/latanimeRouter");
const katanimeRouter = require("./routers/anime/katanimeRouter");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// manga 
app.use("/manga/leercapitulo", leercapituloRuter);
app.use("/manga/tumanhwas/", tumanhwasRouter);
app.use("/manga/tmomanga/", tmomangaRouter);
app.use("/manga/lectortmo/", lectortmoRouter);
app.use("/manga/lectormangalat/", lectorMangaLatRouter);
app.use("/manga/manwhaLatino/", manwhaLatinoRouter)

// anime
app.use("/anime/animeflv", animeflvRouter )
app.use("/anime/animeyt", animeytRouter )
app.use("/anime/latanime", latanimeRouter )
app.use("/anime/katanime", katanimeRouter )



app.get('/', function (_req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
});


var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server listening at http://%s:%s", host, port)
})

