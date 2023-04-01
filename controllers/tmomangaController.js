const request = require("request");
const cheerio = require("cheerio");
const mangaItemsSize = 80;


exports.home = (_, res) => {
    request("https://tmomanga.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var mangaList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
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
            res.send({ data: mangaList });
        }
        else {
            res.send(error);
        }
    });
}

exports.trends = (_, res) => {
    request("https://tmomanga.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var mangaList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
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
}

exports.search = (req, res) => {
    request("https://tmomanga.com/biblioteca?search=" + req.body.term, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var searchResultList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
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
}

exports.mangaInfo = (req, res) => {
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
}

exports.searchByGenre = (req, res) => {
    request("https://tmomanga.com/genero/" + req.body.genre, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.page-item-detail");
            var mangaList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
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
                if (text !== "‹" && text !== "›") {
                    paginationList.push({ page: text, pageUrl: $(el).find("a").attr("href") });
                }
            });

            res.send({ data: mangaList, paginationList: paginationList });
        }
        else {
            res.send(error);
        }
    });
}