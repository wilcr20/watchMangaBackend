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
            anime.url = $(el).find("a").attr("href");
            let chapterNumber = $(el).find("span.Capi").text();
            anime.title = $(el).find("strong").text().replace(/\n/g, '');
            anime.chapterNumber = chapterNumber.replace("Episodio ", "");

            anime.imageUrl = constants.WEBSITE_URL + "/" + $(el).find("span img").attr("src");
            animeList.push(anime);

        });
        res.send({ data: animeList});
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
        let listItems = $(constants.UL_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $(constants.DIV_PAGINATION);
        console.log(buttonsNavigationHTMl.length)
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = constants.WEBSITE_URL + $(el).find(constants.FIGURE_IMG).attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»" && display != "...") {
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
        let listItems = $(constants.UL_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $(constants.DIV_PAGINATION);
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = constants.WEBSITE_URL + $(el).find(constants.FIGURE_IMG).attr("src");
            animeList.push(anime);
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»" && display != "...") {
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

exports.getAnimeInfo = (req, res) => {
    var options = {
        uri: req.body.animeUrl,
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], related: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
        animeInfo.title = $("h1.Title").text();
        animeInfo.description = $("div.Description").text().trim();
        animeInfo.imageUrl = $("div.AnimeCover").find("img").attr("src");


        var relatedAnimeList = $("ul.ListAnmRel li");
        if (relatedAnimeList && relatedAnimeList.length > 0) {
            relatedAnimeList.each((idx, el) => {
                let title = $(el).text().trim();
                animeInfo.related.push(
                    {
                        url: $(el).find("a").attr("href"),
                        name: title
                    });
            });
        }


        let listChapters = JSON.parse(body.split("var episodes =")[1]?.split("var in_library")[0]?.trim()?.replace(",];", "]"))

        for (let index = 0; index < listChapters.length; index++) {
            const chapter = listChapters[index];

            let chapterNumber = chapter[0];
            animeInfo.chapterList.push({
                chapter: "Capítulo " + chapterNumber,
                date: null,
                chapterNumber: chapter[0],
                chapterUrl: req.body.animeUrl + "/" + chapter[1]
            });

        }


        var genreListHtml = $("nav.Nvgnrs a");
        console.log(genreListHtml.length)
        genreListHtml.each((_idx, el) => {
            animeInfo.genreList.push(
                {
                    genre: $(el).text().trim()
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

        animeInfo.title = $("h1.Title").text().trim();
        animeInfo.animeUrl = req.body.animeUrl.split("/episodio")[0];

        const serversNameList = $("ul.CapiTnv li");
        var serversUrlList = body.split('iframe src="');

        serversNameList.each((index, el) => {
            const server = serversUrlList[index + 1];
            const serverUrl = server.split('"')[0]  //.includes("http")
            animeInfo.servers.push(
                {
                    server: $(el).attr("title"),
                    url: serverUrl
                });
        });

        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}


