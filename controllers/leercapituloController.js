const request = require("request");
const cheerio = require("cheerio");
const mangaItemsSize = 80;

exports.home = (_, res) => {
    request("https://www.leercapitulo.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.mainpage-manga");
            var mangaList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
            }
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "leercapitulo" };
                manga.title = $(el).find(".manga-newest").text();
                manga.imageUrl = "https://www.leercapitulo.com" + $(el).find(".cover-manga").find("img").attr("src");
                manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find(".media-body").find("a").attr("href");
                manga.date = $(el).find(".hotup-list").children("i").eq(0).text();
                mangaList.push(manga);
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
}

exports.trends = (_, res) => {
    request("https://www.leercapitulo.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.hot-manga");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", date: null, mangaUrl: "", website: "leercapitulo" };
                manga.title = $(el).find(".thumbnails").find("a").attr("title");
                manga.imageUrl = "https://www.leercapitulo.com" + $(el).find(".thumbnails").find("a").find("img").attr("src");
                manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find(".thumbnails").find("a").attr("href");
                mangaList.push(manga);
            });
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
};

exports.search = (req, res) => {
    request("https://www.leercapitulo.com/search-autocomplete?term=" + req.query.term, function (error, _response, body) {
        var listSearch = JSON.parse(body);
        if (!error) {
            var searchResultList = [];
            for (let index = 0; index < listSearch.length; index++) {
                var result = { title: "", imageUrl: "", mangaUrl: "", website: "leercapitulo" };
                const element = listSearch[index];
                result.title = element.value;
                result.imageUrl = "https://www.leercapitulo.com" + element.thumbnail;
                result.mangaUrl = "https://www.leercapitulo.com" + element.link;
                searchResultList.push(result);
            }
            res.send({ data: searchResultList })
        }
        else {
            res.send(error);
        }
    });
}

exports.mangaInfo = (req, res) => {
    request(req.body.mangaUrl, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "leercapitulo" }
            mangaInfo.title = $(".manga-detail").eq(0).find(".title-manga").text();
            mangaInfo.description = $(".manga-content").eq(0).find(".manga-collapse").text().trim();
            mangaInfo.imageUrl = "https://www.leercapitulo.com" + $(".cover-detail").eq(0).find("img").attr("src");

            var chapterListHtml = $("li.row");
            chapterListHtml.each((_idx, el) => {
                mangaInfo.chapterList.push({ chapter: $(el).text().trim(), chapterUrl: "https://www.leercapitulo.com" + $(el).find("a").attr("href") });
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
}

exports.searchByGenre = (req, res) => {
    request("https://www.leercapitulo.com/genre/" + req.body.genre, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            const listItems = $("div.mainpage-manga");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", genres: "", mangaUrl: "", website: "leercapitulo" };
                manga.title = $(el).find(".manga-newest").text();
                manga.imageUrl = "https://www.leercapitulo.com" + $(el).find(".cover-manga").find("img").attr("src");
                manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find(".media-body").find("a").attr("href");
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
}