const express = require('express');
const leercapituloRuter = require("./routers/leercapituloRouter");
const tumanhwasRouter = require("./routers/tumanhwasRouter");
const tmomangaRouter = require("./routers/tmomangaRouter");
const lectortmoRouter = require("./routers/lectortmoRouter");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Origin", "*");
    next();
});


app.use("/manga/leercapitulo", leercapituloRuter);
app.use("/manga/tumanhwas/", tumanhwasRouter);
app.use("/manga/tmomanga/", tmomangaRouter);
app.use("/manga/lectortmo/", lectortmoRouter);

app.get('/', function (_req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
});


var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server listening at http://%s:%s", host, port)
})

