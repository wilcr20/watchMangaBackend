const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const constants = require("./selectors")


exports.home = (_, res) => {
    cloudscraper.get(constants.WEBSITE_URL).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_EPISODES_HOME);
        console.log(listItems.length)
        var animeList = [];
        listItems.each((_idx, el) => {

            var anime = { title: "", imageUrl: "", url: "", chapterNumber: null, website: constants.WEBSITE_NAME };
            anime.url = constants.WEBSITE_URL + $(el).find("a").attr("href");
            let chapterNumber = $(el).find("div.bg-line.text-subs").text();
            anime.title = $(el).find("header").text().replace(/\n/g, '');

            if (chapterNumber.trim() != "") {
                anime.chapterNumber = chapterNumber.replace("Episodio ", "");
            }
            // anime.chapterNumber = chapterNumber
            anime.imageUrl = $(el).find("figure img").attr("src");
            animeList.push(anime);

        });
        res.send({ data: animeList });
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    var options = {
        uri: req.body.term, // "https://www3.animeflv.net/browse?q=" +
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_EPISODES_HOME);
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $(constants.DIV_PAGINATION);
        console.log(buttonsNavigationHTMl.length)
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = constants.WEBSITE_URL + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find(constants.FIGURE_IMG).attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»" && display != "…") {
                button.display = display;
                button.url = $(el).attr("href") != undefined ? constants.WEBSITE_URL + $(el).attr("href") : null;
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
        let listItems = $(constants.UL_LIST_EPISODES_HOME);
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $(constants.DIV_PAGINATION);
        console.log(listItems.length, buttonsNavigationHTMl.length)
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = constants.WEBSITE_URL + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find(constants.FIGURE_IMG).attr("src");
            animeList.push(anime);
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»" && display != "…") {
                button.display = display;
                button.url = $(el).attr("href") != undefined ? constants.WEBSITE_URL + $(el).attr("href") : null;
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
        animeInfo.title = $("h1:first-of-type").text();
        animeInfo.description = $("div.entry.text-lead.line-clamp-4 p").text().trim();
        animeInfo.imageUrl = $("figure.dark.hidden").find("img").attr("src");


        var relatedAnimeList = $("div.relative div.flex.transform-gpu.gap-2 div.flex.w-72");
        console.log(relatedAnimeList.length)
        if (relatedAnimeList && relatedAnimeList.length > 0) {
            relatedAnimeList.each((idx, el) => {
                let title = $(el).find("h3").text();
                let date = $(el).find("div.text-lead").text()
                console.log(date)
                animeInfo.related.push(
                    {
                        url: constants.WEBSITE_URL + $(el).find("a").attr("href"),
                        name: title + ` (${date})`
                    });
            });
        }


        const capListHTML = $("div article.text-body.relative");
        capListHTML.each((idx, el) => {
            let chapterNumber = $(el).find("div.bg-line.text-subs").text();
            animeInfo.chapterList.push({
                chapter: chapterNumber,
                date: null,
                chapterNumber: idx + 1,
                chapterUrl: constants.WEBSITE_URL + $(el).find("a").attr("href")
            });

        });

        var genreListHtml = $("div.flex.flex-wrap.items-center.gap-2 a");
        genreListHtml.each((_idx, el) => {
            let url = $(el).attr("href");
            if (url.includes("?genre=")) {
                animeInfo.genreList.push(
                    {
                        genre: $(el).text().trim()
                    });
            }

        });
        animeInfo.chapterList = animeInfo.chapterList.reverse()
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

        var jsonString = body.split(',embeds:')[1]?.split(",downloads")[0]


        //Has dub servers
        if (jsonString.split("DUB:")[1]) {
            const dubServers = jsonString.split("DUB:")[1].split(",SUB:")[0]
        }

        if (jsonString.split("SUB:")[1]) {

            const subServers = jsonString.split("SUB:")[1].slice(0, -1);
            servers = subServers.split("server:");
            for (let index = 0; index < servers.length; index++) {
                const element = servers[index];
                if (element.split(",")[0] && element.split(",")[1]) {
                    console.log(element.split(",")[0]?.trim())
                    animeInfo.servers.push(
                        {
                            "server": element.split(",")[0]?.trim().replace('"', '').replace('\"', ''),
                            "url": element.split(",")[1].split("url:")[1]?.trim().replace("}", "").replace("]", "").trim().replace('"', '').replace('\"', ''),
                        }
                    )
                }

            }

            if (animeInfo.servers && animeInfo.servers.length > 0) {
                animeInfo.defaultPlayer = animeInfo.servers[0].url;
            }
        }

        animeInfo.title = $("main div.grid.items-start.gap-1").text();
        animeInfo.animeUrl = constants.WEBSITE_URL + $("main div.grid.items-start.gap-1").find("a").attr("href");

        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}


