var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const iconv = require('iconv-lite');
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const request = require("request")

app.use(function (_req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

var url = "https://www.leercapitulo.com/";


app.get('/', function (_req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
})

app.get('/manga/leercapitulo/home', function (_, res) {
    request(url, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.mainpage-manga");
            console.log(listItems.length);
            const mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: "", mangaUrl: "" };
                manga.title = $(el).find(".manga-newest").text();
                manga.imageUrl = $(el).find(".cover-manga").find("img").attr("src");
                manga.mangaUrl = $(el).find(".media-body").find("a").attr("href");
                manga.date = $(el).find(".hotup-list").children("i").eq(0).text();
                mangaList.push(manga);
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server listening at http://%s:%s", host, port)
})