const request = require("request");
const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const mangaItemsSize = 80;


exports.home = (_, res) => {
    cloudscraper.get('https://tumanhwas.com/').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.styletere");
        var mangaList = [];
        if (listItems.length > mangaItemsSize) {
            let limit = mangaItemsSize - 1;
            listItems = listItems.slice(0, limit);
        }
        listItems.each((_idx, el) => {
            let mangaUrl = $(el).find(".bsx").find("a").attr("href")
                .replace("https://tumanhwas.com/news/", "");
            console.log(mangaUrl, mangaUrl.includes("https://tumanhwas.com"))
            if (mangaUrl.includes("https://tumanhwas.com")) {
                const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "tumanhwas" };
                manga.mangaUrl = mangaUrl;
                manga.title = $(el).find(".bsx .bigor .tt").text().trim().replace(/\n/g, '');
                manga.imageUrl = $(el).find(".bsx .limit").find("img").attr("src");
                mangaList.push(manga);
            }
        });
        res.send({ data: mangaList, body: body });
    }, (err) => {
        res.send(err)
    })
};

exports.trends = (_, res) => {
    request("https://tumanhwas.com/", function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.styletere");
            var mangaList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
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
}

exports.search = (req, res) => {
    request("https://tumanhwas.com/biblioteca?search=" + req.body.term, function (error, _response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            let listItems = $("div.styletere");
            var searchResultList = [];
            if (listItems.length > mangaItemsSize) {
                let limit = mangaItemsSize - 1;
                listItems = listItems.slice(0, limit);
            }
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", mangaUrl: "", website: "tumanhwas" };
                manga.mangaUrl = $(el).find(".bsx").find("a").attr("href");;
                manga.title = $(el).find(".bsx .bigor .tt").text().trim().replace(/\n/g, '');
                manga.imageUrl = $(el).find(".bsx .limit").find("img").attr("src");
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
            const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "tumanhwas" }
            mangaInfo.title = $(".entry-title").eq(0).text();
            mangaInfo.description = $(".entry-content.entry-content-single").eq(0).text().trim();
            mangaInfo.imageUrl = $(".thumb").eq(0).find("img").attr("src");

            var chapterListHtml = $("#chapterlist ul a");
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
}
