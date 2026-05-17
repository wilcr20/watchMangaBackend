const request = require("request");
const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');


exports.home = (_, res) => {
    cloudscraper.get("https://es.novelcool.com/category/latest.html").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.book-item");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "novelcool" };
            manga.title = $(el).find("div.book-name").text().trim();
            manga.mangaUrl = $(el).find("div.book-pic a").attr("href");
            manga.imageUrl = $(el).find("div.book-pic a img").attr("lazy_url");
            manga.date = $(el).find("div.book-data-time").eq(0).text().trim();
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err);
    })

}

exports.trends = (_, res) => {
    cloudscraper.get("https://es.novelcool.com/category/popular.html").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.book-item");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "novelcool" };
            manga.title = $(el).find("div.book-name").eq(0).text().trim();
            manga.mangaUrl = $(el).find("div.book-pic a").attr("href");
            manga.imageUrl = $(el).find("div.book-pic a img").attr("lazy_url");
            manga.date = $(el).find("div.book-data-time").eq(0).text().trim();
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err);
    })
};

exports.search = (req, res) => {
    cloudscraper.get("https://es.novelcool.com/search/?wd=" + req.body.term).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.book-item");
        console.log(listItems.length, req.body.term)
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "novelcool" };
            manga.title = $(el).find("div.book-name").eq(0).text().trim();
            manga.mangaUrl = $(el).find("div.book-pic a").attr("href");
            manga.imageUrl= $(el).find("div.book-pic a img").attr("src");
            manga.date = $(el).find("div.book-data-time").eq(0).text().trim();
            mangaList.push(manga);
        });

        var paginationList = [];
        var paginationListHtml = $("div.page-navone a");
        paginationListHtml.each((_idx, el) => {
            paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).attr("href") });
        });

        res.send({ data: mangaList, paginationList: paginationList });

    }, (err) => {
        res.send(err);
    })
}

exports.mangaInfo = (req, res) => {
    cloudscraper.get(req.body.mangaUrl).then((body) => {
        var $ = cheerio.load(body);
        const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "novelcool" }
        mangaInfo.title = $("h1.bookinfo-title").eq(0).text().trim();
        mangaInfo.description = $("div.bk-summary-txt").eq(0).text().trim();
        mangaInfo.imageUrl = $("img.bookinfo-pic-img").eq(0).attr("src");

        var genreListHtml = $("div.bk-cate-item a span");
        let auxList = [];
        genreListHtml.each((_idx, el) => {
            let genre = $(el).text().trim();
            if (!auxList.includes(genre)) {
                mangaInfo.genreList.push({ genre: genre });
                auxList.push(genre);
            }
        });

        var chapterListHtml = $("div.chapter-item-list div.chp-item");
        chapterListHtml.each((_idx, el) => {
            mangaInfo.chapterList.push({
                chapter: $(el).find(".chapter-item-headtitle").text().trim(),
                chapterUrl: $(el).find("a").attr("href"),
                date: $(el).find(".chapter-item-time").text().trim(),
            });
        });
        res.send(mangaInfo)
    }, (err) => {
        res.send(err);
    })
}

exports.searchByGenre = (req, res) => {
    cloudscraper.get("https://es.novelcool.com/category/" + req.body.genre + ".html")
        .then((body) => {
            var $ = cheerio.load(body);
            let listItems = $("div.book-item");
            console.log(listItems.length, req.body.term)
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", genres: "", mangaUrl: "", website: "novelcool" };
                manga.title = $(el).find("div.book-name").eq(0).text().trim();
                manga.imageUrl = $(el).find("div.book-pic a img").attr("src");
                manga.mangaUrl = $(el).find("div.book-pic a").attr("href");

                var genresHtml = $(el).find(".book-data-info .book-tags .book-tag");
                console.log(genresHtml.length)
                genresHtml.each((_idx, el) => {
                    manga.genres = manga.genres + $(el).text().trim() + ", "
                });

                mangaList.push(manga);
            });

            var paginationList = [];
            var paginationListHtml = $("div.page-navone a");
            paginationListHtml.each((_idx, el) => {
                paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).attr("href") });
            });

            res.send({ data: mangaList, paginationList: paginationList });
        }, (err) => {
            res.send(err);
        });

}