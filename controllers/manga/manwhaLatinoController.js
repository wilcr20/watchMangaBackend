const request = require("request");
const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');


exports.home = (_, res) => {
    cloudscraper.get("https://manhwa-latino.com/").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div#loop-content .page-item-detail");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "manwhaLatino" };
            manga.title = $(el).find("h3").text().trim();
            manga.imageUrl = $(el).find("div.item-thumb a img").attr("data-src").replace("-175x238", "").replace("aio.", "");
            manga.mangaUrl = $(el).find("h3 a").attr("href");
            manga.date = null;
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(error);
    })

}

exports.trends = (_, res) => {
    cloudscraper.get("https://manhwa-latino.com/manga-tag/fin/?m_orderby=trending").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.c-tabs-item .page-item-detail");
        var mangaList = [];
        /*
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "manwhaLatino" };
            manga.title = $(el).find("h3").text().trim();
            manga.imageUrl = $(el).find("img.img-responsive").attr("src").replace("-110x150", "");
            manga.mangaUrl = $(el).find("h3 a").attr("href");
            manga.date = $(el).find(".list-chapter").find("div.chapter-item span.post-on.font-meta").eq(0).text().trim();
            mangaList.push(manga);
        });
        */
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err);
    })
};

exports.search = (req, res) => {
    // "https://manhwa-latino.com/page/1/?s=" + req.body.term + "&post_type=wp-manga&m_orderby=new-manga"
    cloudscraper.get(req.body.searchUrl,).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.c-tabs-item .c-tabs-item__content");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "manwhaLatino" };
            manga.title = $(el).find("h3").text().trim();
            manga.imageUrl = $(el).find("div.tab-thumb a img").attr("data-src").replace("-193x278", "").replace("aio.", "");
            manga.mangaUrl = $(el).find("h3 a").attr("href");
            manga.date = $(el).find(".list-chapter").find("div.chapter-item span.post-on.font-meta").eq(0).text().trim();
            mangaList.push(manga);
        });

        var paginationList = [];
        var paginationListHtml = $(".wp-pagenavi>a");
        paginationListHtml.each((_idx, el) => {
            if ($(el).text().trim() !== "»" && $(el).text().trim() !== "«") {
                paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).attr("href") });
            }
        });

        res.send({ data: mangaList, paginationList: paginationList });
    }, (err) => {
        res.send(err);
    })
}

exports.mangaInfo = (req, res) => {
    cloudscraper.get(req.body.mangaUrl).then((body) => {
        var $ = cheerio.load(body);
        const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "manwhaLatino" }
        mangaInfo.title = $("div#manga-title").eq(0).text().trim();
        mangaInfo.description = $(".summary-container").find("p").eq(0).text().trim();
        mangaInfo.imageUrl = $(".summary_image a").eq(0).find("img").attr("data-src").replace("aio.", "");
        var genreListHtml = $(".genres-content a");
        genreListHtml.each((_idx, el) => {
            mangaInfo.genreList.push({ genre: $(el).text().trim() });
        });

        var chapterListHtml = $("ul.version-chap li");
        chapterListHtml.each((_idx, el) => {
            mangaInfo.chapterList.push(
                {
                    chapter: $(el).find("h4").text().trim(),
                    chapterUrl: $(el).find("div.chapter-thumbnail a").attr("href")
                }
            );
        });

        res.send(mangaInfo);
    }, (err) => {
        res.send(err);
    })
}


exports.searchByGenre = (req, res) => {
    //https://manhwa-latino.com/manga-genre/aventura/?m_orderby=new-manga
    cloudscraper.get(req.body.genreUrl)
        .then((body) => {
            var $ = cheerio.load(body);
            const listItems = $("div.c-tabs-item .page-item-detail");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "", mangaUrl: "", website: "manwhaLatino" };

                manga.title = $(el).find("h3").text().trim();
                manga.imageUrl = $(el).find("div.item-thumb.c-image-hover").find("img").attr("data-src").replace("aio.", "").replace("-175x238", "");
                manga.mangaUrl = $(el).find("h3 a").attr("href");
                mangaList.push(manga);
            });
            var paginationList = [];
            var paginationListHtml = $(".wp-pagenavi>a");
            if (paginationListHtml.length > 0) {
                paginationListHtml.each((_idx, el) => {
                    if ($(el).text().trim() !== "»" && $(el).text().trim() !== "«") {
                        paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).attr("href") });
                    }
                });
            } else {
                var divNextList = $("div.nav-links a");
                if (divNextList.length > 0) {
                    divNextList.each((_idx, el) => {
                        paginationList.push({ page: "Cargar más", pageUrl: $(el).attr("href") });
                    });
                }
            }


            res.send({ data: mangaList, paginationList: paginationList });
        }, (err) => {
            res.send(err);
        });

}