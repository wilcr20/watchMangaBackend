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
        animeInfo.title = $("div.row h2").eq(0).text();
        animeInfo.description = $("div.row p.my-2").eq(0).text().trim();
        animeInfo.imageUrl = $("div.serieimgficha img").attr("src");

        var linksListHtml = $("div.row a");


        linksListHtml.each((_idx, el) => {
            var url = $(el).attr("href");
            if (url.includes("episodio")) {
                let name = $(el).find("img").attr("alt");
                if (name.includes("capitulo")) {
                    name = "Capítulo" + name.split("capitulo")[1];
                }
                animeInfo.chapterList.push({
                    chapter: name,
                    date: null,
                    chapterUrl: url
                });
            }

        });

        linksListHtml.each((_idx, el) => {
            var url = $(el).attr("href");
            if (url.includes("genero")) {
                animeInfo.genreList.push({ genre: $(el).find("div.btn").text().trim() });
            }
        });

        animeInfo.chapterList = animeInfo.chapterList.reverse()

        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}

exports.SeeChapter = (req, res) => {
    cloudscraper.get(req.body.animeUrl).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", date: "", description: "", defaultPlayer: "", servers: [], website: constants.WEBSITE_NAME }

        var serversData = $("ul.cap_repro li");
        var animeInfoData = $("div.container-fluid");

        let controlsHtml = $(animeInfoData).find("div.controles a");
        controlsHtml.each((_idx, el) => {
            var url = $(el).attr("href");
            if (url.includes("/anime/")) {
                animeInfo.animeUrl = url;
            }
        });
        animeInfo.title = $(animeInfoData).find("div.row h2.mojon4").text();

        serversData.each((idx, el) => {
            if (idx > 0) {
                let url = atob($(el).find("a").attr("data-player"));
                let serverName = $(el).find("a").text().trim().replace(/\n/g, '');

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
                    urlFixed = urlFixed.replace("https:https:", "https:");

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
        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        var buttonsNavigationHTMl = $("ul.pagination li");
        var listNavigation = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find("div.seriedetails h3")?.text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("div.series img").attr("src");
            if (anime.imageUrl == "https://latanime.org/public/img/anime.png") {
                anime.imageUrl = $(el).find("img").attr("data-src");
            }

            if (anime.title != "") {
                animeList.push(anime);
            }
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '').trim();
            let url = $(el).find("a").attr("href") || null;

            if (display != "›" && display != "‹" && display != "...") {
                button.display = display;
                button.url = url;
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
            anime.title = $(el).find("div.seriedetails h3")?.text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("data-src");
            if (anime.title != "") {
                animeList.push(anime);
            }
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