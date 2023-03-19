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


app.get('/', function (_req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
})



app.get('/manga/leercapitulo/home', function (_, res) {
    request("https://www.leercapitulo.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.mainpage-manga");
            var mangaList = [];
            if (listItems.length > 71) {
                listItems = listItems.slice(0, 70);
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
    request("https://www.leercapitulo.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.hot-manga");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: null, mangaUrl: "", website: "leercapitulo" };
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
        var listSearch = JSON.parse(body);
        console.log(listSearch[0]);
        if (!error) {
            var searchResultList = []; 
            for (let index = 0; index < listSearch.length; index++) {
                var result = { title: "",  imageUrl: "", mangaUrl: "", website: "leercapitulo" };
                const element = listSearch[index];
                result.title = element.value;
                result.imageUrl = element.thumbnail;
                result.mangaUrl = element.link;
                searchResultList.push(result);
            }
            res.send({data: searchResultList})
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
            const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "leercapitulo" }
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
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.mainpage-manga");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", genres: "", mangaUrl: "", website: "leercapitulo" };
                manga.title = $(el).find(".manga-newest").text();
                manga.imageUrl = $(el).find(".cover-manga").find("img").attr("src");
                manga.mangaUrl = $(el).find(".media-body").find("a").attr("href");
                manga.genres = $(el).find(".descripfix").children().remove().end().text().replace(/\n/g, '').trim();
                mangaList.push(manga);
            });
            var paginationList = [];
            var paginationListHtml = $(".pagination>li");
            paginationListHtml.each((_idx, el) => {
                paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).find("a").attr("href")?.replace("/genre/", "") });
            });

            res.send({ data: mangaList, paginationList: paginationList });
        }
        else {
            res.send(error);
        }
    });
});





//tumanhwas

app.get('/manga/tumanhwas/home', function (_, res) {
    request("https://tumanhwas.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.styletere");
            var mangaList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                let mangaUrl = $(el).find(".bsx").find("a").attr("href")
                    .replace("https://tumanhwas.com/news/", "");
                if (mangaUrl.includes("https://tumanhwas.com")) {
                    const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tumanhwas" };
                    manga.mangaUrl = mangaUrl;
                    manga.title = $(el).find(".bsx .bigor .tt").text().trim().replace(/\n/g, '');
                    manga.imageUrl = $(el).find(".bsx .limit").find("img").attr("src");
                    mangaList.push(manga);
                }
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});


app.get('/manga/tumanhwas/trends', function (_, res) {
    request("https://tumanhwas.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.styletere");
            var mangaList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                let mangaUrl = $(el).find(".bsx").find("a").attr("href")
                    .replace("https://tumanhwas.com/news/", "");
                if (!mangaUrl.includes("https://tumanhwas.com")) {
                    const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tumanhwas" };
                    mangaUrl = mangaUrl.split("-").slice(0, mangaUrl.split("-").length - 1).join("-");
                    manga.mangaUrl = mangaUrl;
                    manga.title = $(el).find(".bsx .bigor .tt").text().trim().replace(/\n/g, '');
                    manga.imageUrl = $(el).find(".bsx .limit").find("img").attr("src");
                    mangaList.push(manga);
                }
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});


app.post('/manga/tumanhwas/search', function (req, res) {
    request("https://tumanhwas.com/biblioteca?search=" + req.body.term, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.styletere");
            var searchResultList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", mangaUrl: "", website: "tumanhwas" };
                manga.mangaUrl = $(el).find(".bsx").find("a").attr("href");;
                manga.title = $(el).find(".bsx .bigor .tt").text().trim().replace(/\n/g, '');
                manga.imageUrl = $(el).find(".bsx .limit").find("img").attr("src");
                searchResultList.push(manga);
            });
            res.send({data: searchResultList});
        }
        else {
            res.send(body)
        }
    });
});


app.post('/manga/tumanhwas/mangaInfo', function (req, res) {
    request(req.body.mangaUrl, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "tumanhwas" }
            mangaInfo.title = $(".entry-title").eq(0).text();
            mangaInfo.description = $(".entry-content.entry-content-single").eq(0).text().trim();
            mangaInfo.imageUrl = $(".thumb").eq(0).find("img").attr("src");

            var chapterListHtml = $("#chapterlist ul a");
            console.log(chapterListHtml.length)
            chapterListHtml.each((_idx, el) => {
                mangaInfo.chapterList.push({ chapter: $(el).text().trim(), chapterUrl: $(el).attr("href") });
            });
            mangaInfo.state = $(".imptdt").find("i").text();
            res.send(mangaInfo)
        }
        else {
            res.send(error);
        }
    });
});


app.get('/manga/tumanhwas/home', function (_, res) {
    request("https://tumanhwas.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.styletere");
            var mangaList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                let mangaUrl = $(el).find(".bsx").find("a").attr("href")
                    .replace("https://tumanhwas.com/news/", "");
                if (mangaUrl.includes("https://tumanhwas.com")) {
                    const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tumanhwas" };
                    manga.mangaUrl = mangaUrl;
                    manga.title = $(el).find(".bsx .bigor .tt").text().trim().replace(/\n/g, '');
                    manga.imageUrl = $(el).find(".bsx .limit").find("img").attr("src");
                    mangaList.push(manga);
                }
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});






// tmomanga

app.get('/manga/tmomanga/home', function (_, res) {
    request("https://tmomanga.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var mangaList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {

                let mangaUrl = $(el).find("a").attr("href")
                    .replace("https://tmomanga.com/capitulo/", "");

                if (!mangaUrl.includes("https://tmomanga.com")) {
                    mangaUrl = mangaUrl.split("-").slice(0, mangaUrl.split("-").length - 1).join("-");
                    const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tmomanga" };
                    manga.mangaUrl = "https://tmomanga.com/manga/" + mangaUrl;
                    manga.title = $(el).find(".manga-title-updated").text().trim().replace(/\n/g, '');
                    manga.imageUrl = $(el).find("img").attr("src");
                    mangaList.push(manga);
                }
            });
            console.log(mangaList.length)
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});


app.get('/manga/tmomanga/trends', function (_, res) {
    request("https://tmomanga.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var mangaList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                let mangaUrl = $(el).find("a").attr("href")
                    .replace("https://tmomanga.com/capitulo/", "");

                if (mangaUrl.includes("https://tmomanga.com")) {
                    const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tmomanga" };
                    manga.mangaUrl = mangaUrl;
                    manga.title = $(el).find("h3").text().trim().replace(/\n/g, '');
                    manga.imageUrl = $(el).find("img").attr("src");
                    mangaList.push(manga);
                }
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
});


app.post('/manga/tmomanga/search', function (req, res) {
    request("https://tmomanga.com/biblioteca?search=" + req.body.term, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var searchResultList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", mangaUrl: "", website: "tmomanga" };
                manga.mangaUrl = $(el).find("a").attr("href");
                manga.title = $(el).find("h3").text().trim().replace(/\n/g, '');
                manga.imageUrl = $(el).find("img").attr("src");
                searchResultList.push(manga);

            });
            res.send({ data: searchResultList });
        }
        else {
            res.send(body)
        }
    });
});


app.post('/manga/tmomanga/mangaInfo', function (req, res) {
    request(req.body.mangaUrl, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "tmomanga" }
            mangaInfo.title = $(".post-title h1").eq(0).text();
            mangaInfo.description = $(".summary__content").eq(0).text().trim();
            mangaInfo.imageUrl = $(".summary_image").eq(0).find("img").attr("src");

            var chapterListHtml = $(".sub-chap.list-chap li");
            chapterListHtml.each((_idx, el) => {
                mangaInfo.chapterList.push({ chapter: $(el).text().trim(), chapterUrl: $(el).find("a").attr("href") });
            });
            var genreListHtml = $(".btn.tags_manga");
            genreListHtml.each((_idx, el) => {
                mangaInfo.genreList.push({ genre: $(el).text().trim() });
            });
            res.send(mangaInfo)
        }
        else {
            res.send(error);
        }
    });
});


app.post('/manga/tmomanga/searchByGenre', function (req, res) {
    request("https://tmomanga.com/genero/" + req.body.genre, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var mangaList = [];
            if (listItems.length > 60) {
                listItems = listItems.slice(0, 59);
            }
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tmomanga" };
                manga.mangaUrl = $(el).find("a").attr("href");
                manga.title = $(el).find("h3").text().trim().replace(/\n/g, '');
                manga.imageUrl = $(el).find("img").attr("src");
                mangaList.push(manga);

            });

            var paginationList = [];
            var paginationListHtml = $(".pagination>li");
            paginationListHtml.each((_idx, el) => {
                let text = $(el).text().trim();
                if(text !== "‹" && text !== "›"){
                    paginationList.push({ page: text, pageUrl: $(el).find("a").attr("href")});
                }
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