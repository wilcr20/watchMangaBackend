const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const constants = require("./selectors")


exports.home = (_, res) => {
    cloudscraper.get(constants.WEBSITE_URL).then((body) => {
        var $ = cheerio.load(body);

        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        console.log(listItems.length)
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
        animeInfo.imageUrl = $("div.thumb img").attr("src");
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
        const animeInfo = { title: "", date: "", description: "", defaultPlayer: "", servers: [], website: constants.WEBSITE_NAME }
        let defaultIframeUrl = $("div.video-content").find("iframe").attr("src")
        // animeInfo.defaultPlayer = defaultIframeUrl.includes("http")  ? defaultIframeUrl : constants.WEBSITE_URL + defaultIframeUrl;
        animeInfo.description = $("div.bixbox.mctn p").eq(0).text().trim();
        animeInfo.date = $("span.year span.updated").text()?.trim();
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
                    if (!urlFixed.includes("short.ink") && (serverName != "Netu"
                        && !serverName.includes("Kraken")
                        && !serverName.includes("Omega")
                        && !serverName.includes("Fembed")
                        && !serverName.includes("Stream")
                    )) {
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
        animeInfo.defaultPlayer = animeInfo.servers[0].url;
        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    cloudscraper.get(constants.SEARCH_URL + req.body.term).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img.ts-post-image").attr("src").replace("?h=300", "");
            animeList.push(anime);
        });
        res.send({ data: animeList });
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
        let prevButton = $("a.l").eq(0).attr("href");
        let nextButton = $("a.r").eq(0).attr("href");
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("src");
            animeList.push(anime);
        });
        res.send({ data: animeList, buttons: { nextBtnUrl: nextButton, prevBtnUrl: prevButton } });
    }, (err) => {
        res.send(err)
    })
}

exports.directoryLatin = (req, res) => {
    //"https://aniyt.net/tv/?sub=dub"
    cloudscraper.get(req.body.url).then((body) => {
        var $ = cheerio.load(body);
        let prevButton = $("a.l").eq(0).attr("href") ? constants.WEBSITE_TV_URL + $("a.l").eq(0).attr("href") : undefined;
        let nextButton = $("a.r").eq(0).attr("href") ? constants.WEBSITE_TV_URL + $("a.r").eq(0).attr("href") : undefined;
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("src");
            animeList.push(anime);
        });
        res.send({ data: animeList, buttons: { nextBtnUrl: nextButton, prevBtnUrl: prevButton } });
    }, (err) => {
        res.send(err)
    })
}


exports.animesComingSoon = (req, res) => {
    cloudscraper.get(req.body.url).then((body) => {
        var $ = cheerio.load(body);
        let prevButton = $("a.l").eq(0).attr("href") ? constants.WEBSITE_TV_URL + $("a.l").eq(0).attr("href") : undefined;
        let nextButton = $("a.r").eq(0).attr("href") ? constants.WEBSITE_TV_URL + $("a.r").eq(0).attr("href") : undefined;
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("h2").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("src");
            animeList.push(anime);
        });
        res.send({ data: animeList, buttons: { nextBtnUrl: nextButton, prevBtnUrl: prevButton } });
    }, (err) => {
        res.send(err)
    })
}