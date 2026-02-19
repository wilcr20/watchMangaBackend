const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const constants = require("./selectors")


exports.home = (_, res) => {
    cloudscraper.get(constants.WEBSITE_URL).then((body) => {
        var $ = cheerio.load(body);

        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        listItems.each((_idx, el) => {
            let type = $(el).find(constants.DIV_TYPE).text();
            if (type != "Próximamente") {
                var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
                anime.url = $(el).find("a").attr("href")?.trim();
                anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
                anime.imageUrl = $(el).find("img").attr("data-src");
                animeList.push(anime);
            }
        });
        res.send({ data: animeList });
    }, (err) => {
        res.send(err)
    })
}

exports.homeSeeMore = (_, res) => {
    cloudscraper.get(constants.WEBSITE_URL + 'page/2/').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        listItems.each((_idx, el) => {
            let type = $(el).find(constants.DIV_TYPE).text();
            if (type != "Próximamente") {
                var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
                anime.url = $(el).find("a").attr("href")?.trim();
                anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
                anime.imageUrl = $(el).find("img").attr("src");
                animeList.push(anime);
            }

        });
        res.send({ data: animeList });
    }, (err) => {
        res.send(err)
    })
}

exports.getAnimeInfo = (req, res) => {
    cloudscraper.get(req.body.animeUrl).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
        animeInfo.title = $("h1.entry-title").eq(0).text();
        animeInfo.description = $("div.entry-content").eq(0).text().trim();
        animeInfo.imageUrl = $("div.thumb img").attr("data-src");
        var chapterListHtml = $("div.eplister ul li");
        chapterListHtml.each((_idx, el) => {
            animeInfo.chapterList.push({
                chapter: $(el).find(".epl-title").text().trim(),
                date: $(el).find(".epl-date").text().trim(),
                chapterNumber: chapterListHtml.length - _idx,
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
        const animeInfo = { title: "", date: "", description: "", defaultPlayer: "", servers: [], website: constants.WEBSITE_NAME }

        animeInfo.description = $("div.bixbox.mctn p").eq(0).text().trim();
        animeInfo.date = $("span.year span.updated").text()?.trim().split("Autor")[0];
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
                let urlFixed = "";
                if (url) {
                    if ((serverName == "Omega" || serverName == "Lions" || serverName == "Moon")
                        && !url.includes("http") && !url.includes("ok.ru")) {
                        urlFixed = constants.WEBSITE_URL + url;
                    } else if (url.includes("ok.ru") || url.includes("sendvid")) {
                        urlFixed = "https:" + url;
                    }
                    else {
                        urlFixed = url;
                    }
                    urlFixed = urlFixed.replace("http:", "https:");
                    if (true) {
                        animeInfo.servers.push(
                            {
                                "server": serverName,
                                "url": urlFixed
                            }
                        )
                    }
                }


            }
        })
        if (animeInfo.servers && animeInfo.servers.length > 0) {
            animeInfo.defaultPlayer = animeInfo.servers[0].url;
        }
        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    cloudscraper.get(req.body.term).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        var buttonsNavigationHTMl = $("div.hpage a");
        var listNavigation = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img.ts-post-image").attr("data-src").replace("?h=300", "");
            animeList.push(anime);
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            button.display = display;
            button.url = "https://animeytx.net/tv/" + $(el).attr("href");
            listNavigation.push(button);

        });

        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    });
}


exports.ongoing = (_, res) => {
    cloudscraper.get(constants.ANIMES_ONGOING_URL).then((body) => {
        var $ = cheerio.load(body);
        const animeList = { title: "", sections: [], website: constants.WEBSITE_NAME }
        animeList.title = $(".releases h1").text();
        let sectionbyDaysHTML = $("div.postbody div.schedulepage");
        sectionbyDaysHTML.each((idx, el) => {

            let listItems = $(el).find("div.bsx");
            let animeListByDay = [];
            listItems.each((_idx, el) => {
                var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
                anime.url = $(el).find("a").attr("href").trim();
                anime.title = $(el).find("a").attr("title").trim()?.replace(/\n/g, '');
                anime.imageUrl = $(el).find("div.limit img").attr("src")?.replace(constants.RESIZE_IMG, "");
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

        var buttonsNavigationHTMl = $("div.pagination a.page-numbers");
        var listNavigation = [];

        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (!display.includes("«") && !display.includes("»")) {
                button.display = display;
                button.url = $(el).attr("href");
                listNavigation.push(button);
            }

        });

        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    })
}


exports.filterSearch = (req, res) => {
    var options = {
        uri: req.body.url,
        timeout: 10000
    }
    console.log(req.body.url)

    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        var buttonsNavigationHTMl = $("div.hpage a");
        var listNavigation = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("data-src");
            animeList.push(anime);

        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            button.display = display;
            button.url = "https://animeytx.net/tv/" + $(el).attr("href");
            listNavigation.push(button);

        });
        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    });
}