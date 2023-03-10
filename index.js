var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cheerio = require("cheerio");
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
            let listItems = $("div.mainpage-manga");
            var mangaList = [];
            if(listItems.length > 60){
                listItems = listItems.slice(0,59);
            }
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "leercapitulo" };
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

app.get('/manga/leercapitulo/trends', function (_, res) {
    request(url, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.hot-manga");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: null, mangaUrl: "", website: "leercapitulo"  };
                manga.title = $(el).find(".thumbnails").find("a").attr("title");
                manga.imageUrl = $(el).find(".thumbnails").find("a").find("img").attr("src");
                manga.mangaUrl = $(el).find(".thumbnails").find("a").attr("href");
                mangaList.push(manga);
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});

app.get('/manga/leercapitulo/search', function (req, res) {
    request("https://www.leercapitulo.com/search-autocomplete?term=" + req.query.term, function (error, _response, body) {
        if (!error) {
            // body.forEach((_idx, el) => {
            //     const suggestion = { title: "", imageUrl: "", mangaUrl: "" };
            //     suggestion.title = el.value;
            //     suggestion.imageUrl = el.thumbnail;
            //     suggestion.mangaUrl = el.link;
            //     suggestionList.push(suggestion);
            // });
            res.send(body)
        }
        else {
            res.send(error);
        }
    });
});

app.post('/manga/leercapitulo/mangaInfo', function (req, res) {
    request("https://www.leercapitulo.com" + req.body.mangaUrl, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "leercapitulo"  }
            mangaInfo.title = $(".manga-detail").eq(0).find(".title-manga").text();
            mangaInfo.description = $(".manga-content").eq(0).find(".manga-collapse").text().trim();
            mangaInfo.imageUrl = $(".cover-detail").eq(0).find("img").attr("src");

            var chapterListHtml = $("li.row");
            chapterListHtml.each((_idx, el) => {
                mangaInfo.chapterList.push({ chapter: $(el).text().trim(), chapterUrl: $(el).find("a").attr("href") });
            });

            var genreListHtml = $(".description-update>a");
            genreListHtml.each((_idx, el) => {
                mangaInfo.genreList.push({ genre: $(el).text().trim() });
            });
            var state = $(".description-update").children().remove().end().text().replace(/\n/g, '');
            mangaInfo.state = state.split(",").reverse()[0].trim();
            res.send(mangaInfo)
        }
        else {
            res.send(error);
        }
    });
});

app.post('/manga/leercapitulo/searchByGenre', function (req, res) {
    request("https://www.leercapitulo.com/genre/" + req.body.genre, function (error, _response, body) {
        console.log("https://www.leercapitulo.com/genre/" + req.body.genre);
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.mainpage-manga");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", genres: "", mangaUrl: "", website: "leercapitulo"  };
                manga.title = $(el).find(".manga-newest").text();
                manga.imageUrl = $(el).find(".cover-manga").find("img").attr("src");
                manga.mangaUrl = $(el).find(".media-body").find("a").attr("href");
                manga.genres = $(el).find(".descripfix").children().remove().end().text().replace(/\n/g, '').trim();
                mangaList.push(manga);
            });
            var paginationList = [];
            var paginationListHtml = $(".pagination>li");
            paginationListHtml.each((_idx, el) => {
                paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).find("a").attr("href")?.replace("/genre/","") });
            });

            res.send({ data: mangaList, paginationList: paginationList });
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