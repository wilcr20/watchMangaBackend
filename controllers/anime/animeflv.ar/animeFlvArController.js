const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const constants = require("./selectors")
const puppeteer = require('puppeteer')


exports.home = (_, res) => {
    cloudscraper.get(constants.WEBSITE_URL).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_EPISODES_HOME);
        var animeList = [];
        listItems.each((_idx, el) => {

            var anime = { title: "", imageUrl: "", url: "", chapterNumber: null, website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href");
            let chapterNumber = $(el).find("span.epx").text();
            if (chapterNumber.trim() != "") {
                anime.chapterNumber = chapterNumber.replace("Ep ", "");
            }
            anime.title = $(el).find("div.tt").text().split("\t\t\t\t")[1].trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("a img").attr("src")
            animeList.push(anime);

        });
        res.send({ data: animeList });
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    var options = {
        uri: req.body.term, // https://animeflv.ar/?s=
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("div.tt").text().split("\t\t\t\t")[1].trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("a img").attr("src")
            animeList.push(anime);
        });


        var buttonsNavigationHTMl = $(constants.DIV_PAGINATION);

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
    });
}


exports.filterSearch = (req, res) => {
    var options = {
        uri: req.body.url,
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("div.tt").text().split("\t\t\t\t")[1].trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("a img").attr("src")
            animeList.push(anime);
        });

        var buttonsNavigationHTMl = $(constants.DIV_PAGINATION);

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
    });
}

exports.getAnimeInfo = (req, res) => {
    var options = {
        uri: req.body.animeUrl,
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], related: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
        animeInfo.title = $("div.infox h1.entry-title").text();
        animeInfo.description = $("div.bixbox.synp div.entry-content").text().trim();
        animeInfo.imageUrl = $("div.thumbook").find("img").attr("src");

        var animeChapterList = $(".eplister li")
        animeChapterList.each((_idx, el) => {
            animeInfo.chapterList.push({
                chapter: "Capítulo " + $(el).find(".epl-num").text(),
                date: $(el).find(".epl-date").text().trim(),
                chapterNumber: $(el).find(".epl-num").text(),
                chapterUrl: $(el).find("a").attr("href")
            });
        });

        res.send(animeInfo)
    }, (err) => {
        res.send(animeInfo)
    })
}

exports.SeeChapter = (req, res) => {
    var options = {
        uri: req.body.animeUrl,
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", date: null, description: null, defaultPlayer: "", servers: [], website: constants.WEBSITE_NAME }
        try {
            var breadcrumbHtml = $("div.ts-breadcrumb.bixbox span");
            breadcrumbHtml.each((idx, el) => {
                if (idx == 2) {
                    animeInfo.animeUrl = $(el).find("a").attr("href");
                    animeInfo.title = $(el).text().trim();
                }
            })


            let listServer = $("select.mirror option");
            listServer.each((idx, el) => {
                let value = $(el).attr("value").trim();
                if (value != "") {
                    let url = atob(value);
                    url = url.split('iframe src="')[1].split('"')[0]

                    if (url.includes("ok.ru") || url.includes("sendvid")) {
                        url = "https:" + url;
                    }
                    animeInfo.servers.push(
                        {
                            "server": idx,
                            "url": url
                        }
                    )
                }
            })




            if (animeInfo.servers && animeInfo.servers.length > 0) {
                animeInfo.defaultPlayer = animeInfo.servers[0].url;
            }
            res.send(animeInfo)
        } catch (error) {
            res.send(animeInfo)
        }

    }, (err) => {
        res.send(err)
    })
}
