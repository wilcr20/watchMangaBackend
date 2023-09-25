const request = require("request");
const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const mangaItemsSize = 80;

exports.home = (_, res) => {
    cloudscraper.get('https://lectortmo.com/populars').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.element");
        var mangaList = [];
        if (listItems.length > mangaItemsSize) {
            let limit = mangaItemsSize - 1;
            listItems = listItems.slice(0, limit);
        }
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", mangaUrl: "", website: "lectortmo" };
            manga.mangaUrl = $(el).find("a").attr("href").trim();
            manga.title = $(el).find("h4").text().trim().replace(/\n/g, '');
            manga.imageUrl = $(el).find("style").text().trim().replace(/\n/g, '').split("('")[1].split("')")[0];
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err)
    })
}

exports.trends = (_, res) => {
    cloudscraper.get('https://lectortmo.com/').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.element");
        var mangaList = [];
        if (listItems.length > mangaItemsSize) {
            let limit = mangaItemsSize - 1;
            listItems = listItems.slice(0, limit);
        }
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", mangaUrl: "", website: "lectortmo" };
            manga.mangaUrl = $(el).find("a").attr("href").trim();
            manga.title = $(el).find("h4").text().trim().replace(/\n/g, '');
            manga.imageUrl = $(el).find("style").text().trim().replace(/\n/g, '').split("('")[1].split("')")[0];
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    cloudscraper.get("https://lectortmo.com/library?_pg=1&title=" + req.body.term).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.element");
        var mangaList = [];
        if (listItems.length > mangaItemsSize) {
            let limit = mangaItemsSize - 1;
            listItems = listItems.slice(0, limit);
        }
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", mangaUrl: "", website: "lectortmo" };
            manga.mangaUrl = $(el).find("a").attr("href").trim();
            manga.title = $(el).find("h4").text().trim().replace(/\n/g, '');
            manga.imageUrl = $(el).find("style").text().trim().replace(/\n/g, '').split("('")[1].split("')")[0];
            mangaList.push(manga);
        });
        res.send({ data: mangaList });
    }, (err) => {
        res.send(err)
    });
}

exports.mangaInfo = (req, res) => {
    cloudscraper.get(req.body.mangaUrl).then((body) => {
        var $ = cheerio.load(body);
        const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "lectortmo" }
        mangaInfo.title = $(".element-subtitle").eq(0).text();
        mangaInfo.description = $(".element-description").eq(0).text().trim();
        mangaInfo.imageUrl = $(".row .book-thumbnail").eq(-1).attr("src");
        mangaInfo.state = $(".book-status.publishing").text().trim();

        var chapterListHtml = $("ul.list-group.list-group-flush li.upload-link");
        chapterListHtml.each((_idx, el) => {
            mangaInfo.chapterList.push({
                chapter: $(el).find(".btn-collapse").text().trim(),
                chapterUrl: $(el).find(".text-right a").eq(0).attr("href")
            });
        });
        var genreListHtml = $("h6 .badge");
        genreListHtml.each((_idx, el) => {
            mangaInfo.genreList.push({ genre: $(el).text().trim() });
        });
        res.send(mangaInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.searchByGenre = (req, res) => {
    // "https://lectortmo.com/library?order_item=likes_count&order_dir=desc&title=&_pg=1&&genders%5B%5D=
    cloudscraper.get("https://lectortmo.com/library?order_item=likes_count&order_dir=desc&title=&_pg=1&filter_by=title&type=&demography=&status=&translation_status=&webcomic=&yonkoma=&amateur=&erotic=&genders%5B%5D=" + req.body.genre).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.element");
        var mangaList = [];
        if (listItems.length > mangaItemsSize) {
            let limit = mangaItemsSize - 1;
            listItems = listItems.slice(0, limit);
        }
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", mangaUrl: "", website: "lectortmo" };
            manga.mangaUrl = $(el).find("a").attr("href").trim();
            manga.title = $(el).find("h4").text().trim().replace(/\n/g, '');
            manga.imageUrl = $(el).find("style").text().trim().replace(/\n/g, '').split("('")[1].split("')")[0];
            mangaList.push(manga);
        });
        res.send({ data: mangaList, paginationList: [] });
    }, (err) => {
        res.send(err)
    });
}