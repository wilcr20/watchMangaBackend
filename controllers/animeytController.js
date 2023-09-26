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
        res.send(err)
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
        res.send(err)
    })
}

exports.getAnimeInfo = (req, res) => {
    cloudscraper.get(req.body.animeUrl).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "animeyt" }
        animeInfo.title = $("h1.entry-title").eq(0).text();
        animeInfo.description = $("div.entry-content").eq(0).text().trim();
        animeInfo.imageUrl = $("div.thumb").find("img").attr("data-src");
        var chapterListHtml = $("div.eplister ul li");
        chapterListHtml.each((_idx, el) => {
            animeInfo.chapterList.push({
                chapter: $(el).find(".epl-title").text().trim(),
                date: $(el).find(".epl-date").text().trim(),
                chapterUrl: $(el).find("a").attr("href")
            });
        });
        var genreListHtml = $("div.genxed a");
        genreListHtml.each((_idx, el) => {
            animeInfo.genreList.push({ genre: $(el).text().trim() });
        });
        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.SeeChapter = (req, res) => {
    cloudscraper.get(req.body.animeUrl).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", date: "", description: "", defaultPlayer: "", servers: [], website: "animeyt" }
        animeInfo.defaultPlayer = "https://animeyt.es/" + $("div.video-content").find("iframe").attr("src")
        animeInfo.description = $("div.bixbox.mctn p").eq(0).text().trim();
        animeInfo.date = $("span.year span.updated").text();
        var animeInfoData = $("div.ts-breadcrumb ol li");
        var serversData = $("select.mirror option");
        animeInfoData.each((idx, el) => {
            if (idx == 1) {
                animeInfo.animeUrl = $(el).find("a").attr("href");
                animeInfo.title = $(el).find("a span").text();
            }
        })
        serversData.each((idx, el) => {
            if (idx > 0) {
                let iframeHtml = atob($(el).attr("value"));
                let url = $(iframeHtml).attr("src");
                let serverName = $(el).text().trim().replace(/\n/g, '');
                animeInfo.servers.push(
                    {
                        "server": serverName,
                        "url": serverName == "Omega" ? "https://animeyt.es/" + url : url
                    }
                )
            }
        })
        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    cloudscraper.get("https://animeyt.es/?s=" + req.body.term).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("div.listupd article.bs");
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeyt" };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img.ts-post-image").attr("data-src").replace("?h=300", "");
            animeList.push(anime);
        });
        res.send({ data: animeList });
    }, (err) => {
        res.send(err)
    });
}

exports.recomendation = (_, res) => {
    cloudscraper.get("https://animeyt.es/random").then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", animeUrl: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "animeyt" }
        animeInfo.title = $("h1.entry-title").eq(0).text();
        animeInfo.description = $("div.entry-content").eq(0).text().trim();
        animeInfo.imageUrl = $("div.thumb").find("img").attr("data-src");

        let breadcrumbHTML = $(".ts-breadcrumb ol li")
        breadcrumbHTML.each((idx, el) => {
            if (idx == 1) {
                animeInfo.animeUrl = $(el).find("a").attr("href");
            }
        })

        var chapterListHtml = $("div.eplister ul li");
        chapterListHtml.each((_idx, el) => {
            animeInfo.chapterList.push({
                chapter: $(el).find(".epl-title").text().trim(),
                date: $(el).find(".epl-date").text().trim(),
                chapterUrl: $(el).find("a").attr("href")
            });
        });
        var genreListHtml = $("div.genxed a");
        genreListHtml.each((_idx, el) => {
            animeInfo.genreList.push({ genre: $(el).text().trim() });
        });
        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.ongoing = (_, res) => {
    cloudscraper.get("https://animeyt.es/anime-en-emision/").then((body) => {
        var $ = cheerio.load(body);
        const animeList = { title: "", sections: [], website: "animeyt" }
        animeList.title = $(".releases h1").text();
        let sectionbyDaysHTML = $("div.postbody div.schedulepage");
        sectionbyDaysHTML.each((idx, el) => {

            let listItems = $(el).find("div.bsx");
            let animeListByDay = [];
            listItems.each((_idx, el) => {
                var anime = { title: "", imageUrl: "", url: "", website: "animeyt" };
                anime.url = $(el).find("a").attr("href").trim();
                anime.title = $(el).find("a").attr("title").trim()?.replace(/\n/g, '');
                anime.imageUrl = $(el).find("img.ts-post-image").attr("data-src")?.replace("?h=300", "");
                animeListByDay.push(anime);
            });

            animeList.sections.push(
                {
                    day: $(el).find("h3").text().trim(),
                    animeList: animeListByDay
                });
        });

        res.send(animeList)
    }, (err) => {
        res.send(err)
    })
}

exports.directory = (req, res) => {
    cloudscraper.get(req.body.url).then((body) => {
        var $ = cheerio.load(body);
        let prevButton = $("a.l").eq(0).attr("href");
        let nextButton = $("a.r").eq(0).attr("href");
        let listItems = $("div.listupd article.bs");
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeyt" };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img.ts-post-image").attr("data-src").replace("?resize=200,200", "");
            animeList.push(anime);
        });
        res.send({ data: animeList, buttons: { nextBtnUrl: nextButton, prevBtnUrl: prevButton  } });
    }, (err) => {
        res.send(err)
    })
}