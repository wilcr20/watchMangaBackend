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
                let chapterNumber = $(el).find("span._2y8kd").text()?.trim();
                anime.title = $(el).find("div._2NNxg a").text()?.trim().replace(/\n/g, '') + " - " + chapterNumber;
                anime.imageUrl = $(el).find("img").attr("data-src");
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
        animeInfo.title = $("h1.comics-title").eq(0).text();
        animeInfo.description = $("div#sinopsis p").eq(0).text().trim();
        animeInfo.imageUrl = $("div.serieimgficha img").attr("src");

        var chaptersCount = $("h3.comics-caps").text();
        if (chaptersCount.includes("/")) {
            chaptersCount = Number(chaptersCount.split("/")[0]);
        } else {
            chaptersCount = Number(chaptersCount.split(" Capítulo")[0])
        }

        var genreListHtml = $("div.anime-genres a");
        var nextChapter = $("div.hachikuji b").eq(1).text().trim();
        var chapterUrl_prefix = req.body.animeUrl.replace("/anime/", "/capitulo/").slice(0, -1);

        if (nextChapter && nextChapter != "") {
            animeInfo.chapterList.push({
                chapter: "Próximo capítulo: " + nextChapter,
                date: null,
                chapterUrl: null
            });
        }

        for (let index = chaptersCount; index > 0; index--) {
            animeInfo.chapterList.push({
                chapter: "Capítulo " + index,
                date: null,
                chapterUrl: chapterUrl_prefix + "-" + index
            });
        }


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

        var serversData = $("ul.ul-drop li");
        var animeInfoData = $("div#blocks");

        animeInfo.animeUrl = $(animeInfoData).find("div.animeinfo a").attr("href");
        animeInfo.title = $(animeInfoData).find("h1.cap_title").text();

        serversData.each((idx, el) => {
            if (idx > 0) {
                let url = "https://katanime.net/reproductor?url=" + $(el).find("a").attr("data-player");
                let serverName = $(el).find("a").text().trim().replace(/\n/g, '');

                if (url) {

                    url = url.replace("http:", "https:");
                    url = url.replace("https:https:", "https:");

                    animeInfo.servers.push(
                        {
                            "server": serverName,
                            "url": url
                        }
                    )

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
        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        var buttonsNavigationHTMl = $("ul.pagination li");
        var listNavigation = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("div._2NNxg a").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("src");

            animeList.push(anime);

        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display != "›" && display != "‹" && display != "...") {
                button.display = display;
                button.url = $(el).find("a").attr("href") || null;
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
        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        var buttonsNavigationHTMl = $("ul.pagination li");
        var listNavigation = [];
        
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("div._2NNxg a").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("data-src");

            animeList.push(anime);

        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display != "›" && display != "‹" && display != "...") {
                button.display = display;
                button.url = $(el).find("a").attr("href") || null;
                listNavigation.push(button);
            }
        });
        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    });
}