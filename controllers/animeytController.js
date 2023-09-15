const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');

exports.home = (_, res) => {
    cloudscraper.get('https://animeyt.es/').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.excstf article.styletwo");
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeyt" };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img.ts-post-image").attr("data-src").replace("?resize=200,200", "");
            animeList.push(anime);
        });
        res.send({ data: animeList });
    }, (err) => {
        response.send(err)
    })
}

exports.homeSeeMore = (_, res) => {
    cloudscraper.get('https://animeyt.es/page/2/').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.excstf article.styletwo");
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeyt" };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img.ts-post-image").attr("data-src").replace("?resize=200,200", "");
            animeList.push(anime);
        });
        res.send({ data: animeList });
    }, (err) => {
        response.send(err)
    })
}