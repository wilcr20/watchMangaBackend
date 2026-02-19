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
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            let chapterNumber = $(el).find("span.badge-primary").text().trim() || "";

            anime.url = $(el).find("div.card a").attr("href")?.trim();
            anime.title = $(el).find("div.card-body h5").text()?.trim().replace(/\n/g, '');
            anime.title = anime.title + " " + chapterNumber;
            anime.imageUrl = $(el).find("img.card-img-top").attr("src");

            if (shouldAddAnimeToLits(animeList, anime.title) && anime.url) {
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
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], related: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
        animeInfo.title = $("div.anime_info h3").eq(0).text().trim();
        animeInfo.description = $("div.anime_info p").eq(0).text().trim();
        animeInfo.imageUrl = $("div.anime_pic img").attr("src");
        var relatedAnimeList = $("div.temporadas_tab div.col.col-lg-6 a");
        console.log(relatedAnimeList.length)

        if (relatedAnimeList && relatedAnimeList.length > 0) {
            relatedAnimeList.each((idx, el) => {
                let type = $(el).text();
                animeInfo.related.push(
                    {
                        url: $(el).attr("href"),
                        name: type
                    });
            });
        }

        var chapterCount = 0;

        // anime still in progress
        var lastChapterUrl = $("div#proxep a").attr("href");
        if (lastChapterUrl) {
            chapterCount = Number(lastChapterUrl.split(req.body.animeUrl)[1].slice(0, -1))
        }
        else {
            // anime finished

            var chapterNumbersHtml = $("div.card-bod li");
            if (chapterNumbersHtml.length > 0) {
                chapterNumbersHtml.each((_idx, el) => {
                    let text = $(el).text()
                    if (text.includes("Episodios")) {
                        chapterCount = Number(text.split("Episodios: ")[1]);
                    }
                });
            }
        }

        if (chapterCount > 0) {
            for (let index = chapterCount; index > 0; index--) {
                animeInfo.chapterList.push({
                    chapter: "Capítulo " + index,
                    date: null,
                    chapterUrl: req.body.animeUrl + index,
                })
            }
        }


        var genreListHtml = $("div.card-bod a");
        let localList = [];

        genreListHtml.each((_idx, el) => {
            let url = $(el).attr("href");

            if (url.includes("/genero/")) {
                let genreObject = { genre: $(el).text().trim() };
                if (!localList.includes(url)) {
                    animeInfo.genreList.push(genreObject);
                    localList.push(url)
                }
            }
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

        var serversData = $("div.bg-servers a");
        var animeInfoData = $("section.contenido");

        // let controlsHtml = $(animeInfoData).find("div.controles a");
        // controlsHtml.each((_idx, el) => {
        //     var url = $(el).attr("href");
        //     if (url.includes("/anime/")) {
        //         animeInfo.animeUrl = url;
        //     }
        // });

        animeInfo.title = $(animeInfoData).find("div.breadcrumb__links h1").text();

        serversData.each((idx, el) => {
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
            anime.title = $(el).find("div.seriedetails h3")?.text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("data-src");
            if (anime.title != "") {
                animeList.push(anime);
            }
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display != "›" && display != "‹") {
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

function shouldAddAnimeToLits(list, title) {
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (element.title == title) {
            return false;
        }
    }
    return true;
}