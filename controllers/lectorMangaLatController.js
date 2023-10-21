const request = require("request");
const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');


exports.home = (_, res) => {
    cloudscraper.get("https://www.lectormanga.lat/").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div#loop-content .page-item-detail");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "lectormangaLat" };
            manga.title = $(el).find("h3").text().trim();
            manga.imageUrl = $(el).find("img.img-responsive").attr("src").replace("-110x150", "");
            manga.mangaUrl = $(el).find("h3 a").attr("href");
            manga.date = $(el).find(".list-chapter").find("div.chapter-item span.post-on.font-meta").eq(0).text().trim();
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(error);
    })

}

exports.trends = (_, res) => {
    cloudscraper.get("https://www.lectormanga.lat/biblioteca/?m_orderby=trending").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.c-tabs-item .page-item-detail");
        var mangaList = [];
        console.log(listItems.length);
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "lectormangaLat" };
            manga.title = $(el).find("h3").text().trim();
            manga.imageUrl = $(el).find("img.img-responsive").attr("src").replace("-110x150", "");
            manga.mangaUrl = $(el).find("h3 a").attr("href");
            manga.date = $(el).find(".list-chapter").find("div.chapter-item span.post-on.font-meta").eq(0).text().trim();
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err);
    })
};

exports.search = (req, res) => {
    cloudscraper.get("https://www.lectormanga.lat/?s=" + req.body.term + "&post_type=wp-manga&op&author&artist&release&adult&m_orderby=latest").then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.c-tabs-item .c-tabs-item__content");
        var mangaList = [];
        console.log(listItems.length);
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "lectormangaLat" };
            manga.title = $(el).find("h3").text().trim();
            manga.imageUrl = $(el).find("img.img-responsive").attr("src").replace("-193x278", "");
            manga.mangaUrl = $(el).find("h3 a").attr("href");
            manga.date = $(el).find(".list-chapter").find("div.chapter-item span.post-on.font-meta").eq(0).text().trim();
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err);
    })
}

exports.mangaInfo = (req, res) => {
    cloudscraper.get(req.body.mangaUrl).then((body) => {
        var $ = cheerio.load(body);
        const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "lectormangaLat" }
        mangaInfo.title = $("div.post-title").eq(0).text().trim();
        mangaInfo.description = $(".summary__content").find("p").eq(0).text().trim();
        mangaInfo.imageUrl = $(".summary_image").eq(0).find("img").attr("src").replace("-193x278", "");
        var genreListHtml = $(".genres-content a");
        genreListHtml.each((_idx, el) => {
            mangaInfo.genreList.push({ genre: $(el).text().trim() });
        });
        mangaInfo.state = $(".summary-content").last().text().replace(/\n/g, '');
        cloudscraper.post(req.body.url + "ajax/chapters/").then((body) => {
            let $ = cheerio.load(body);
            var chapterListHtml = $("div.listing-chapters_wrap li.wp-manga-chapter ");
            chapterListHtml.each((_idx, el) => {
                mangaInfo.chapterList.push({ chapter: $(el).find("a").text().trim(), chapterUrl: $(el).find("a").attr("href") });
            });
            res.send(mangaInfo)
        }, (err) => {
            res.send(mangaInfo);
        });
    }, (err) => {
        res.send(err);
    })
}

exports.searchByGenre = (req, res) => {
    cloudscraper.get("https://www.lectormanga.lat/comics-genero/" + req.body.genre + "/?m_orderby=new-manga")
        .then((body) => {
            var $ = cheerio.load(body);
            const listItems = $("div.c-tabs-item .page-item-detail");
            var mangaList = [];
            listItems.each((_idx, el) => {
                const manga = { title: "", imageUrl: "",  mangaUrl: "", website: "lectormangaLat" };

                manga.title = $(el).find("h3").text().trim();
                manga.imageUrl = $(el).find("img.img-responsive").attr("src").replace("-110x150", "");
                manga.mangaUrl = $(el).find("h3 a").attr("href");
                mangaList.push(manga);
            });
            var paginationList = [];
            var paginationListHtml = $(".pagination>li");
            paginationListHtml.each((_idx, el) => {
                paginationList.push({ page: $(el).text().trim(), pageUrl: $(el).find("a").attr("href")?.replace("/genre/", "") });
            });

            res.send({ data: mangaList, paginationList: paginationList });
        }, (err) => {
            res.send(err);
        });

}