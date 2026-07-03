const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const constants = require("./selectors")

exports.home = (_, res) => {
    cloudscraper.get(constants.WEBSITE_URL).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_EPISODES_HOME);
        var animeList = [];
        listItems.each((_idx, el) => {

            var anime = { title: "", imageUrl: "", url: "", chapterNumber: null, website: constants.WEBSITE_NAME };
            anime.url = constants.WEBSITE_URL + $(el).find("a").attr("href");
            anime.title = $(el).find("h3").text().replace(/\n/g, '');
            anime.imageUrl = constants.WEBSITE_URL + $(el).find("a img").attr("src").replace(constants.RESIZE_IMG, "");

            let titleSplitted = anime.title.split(" ");
            let chapterNumber = titleSplitted[titleSplitted.length - 1];
            if (chapterNumber && chapterNumber.trim() != "") {
                anime.chapterNumber = chapterNumber;
            }
            animeList.push(anime);
        });
        res.send({ data: animeList });
    }, (err) => {
        res.send(err)
    })
}

exports.search = (req, res) => {
    var options = {
        uri: req.body.term, // "https://tioanime.com/directorio?q=" +
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
            anime.url = constants.WEBSITE_URL + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = constants.WEBSITE_URL + $(el).find(constants.FIGURE_IMG).attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).find("a").text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»") {
                button.display = display;
                button.url = constants.WEBSITE_URL + $(el).find("a").attr("href");
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
    //https://tioanime.com/directorio?genero%5B%5D=ecchi&status=2&sort=recent
    //https://tioanime.com/directorio?year=2025%2C2026&status=2&sort=recent&p=1  this will search just for 2025 year
    // https://tioanime.com/directorio?year=2024%2C2025&status=2&sort=recent&p=9  just 2024
    // https://tioanime.com/directorio?year=2026%2C2027&status=2&sort=recent&p=4 just 2026 
    cloudscraper.get(options).then((body) => {
        var $ = cheerio.load(body);
        let listItems = $(constants.UL_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $("ul.pagination li:not(.active)");
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = constants.WEBSITE_URL + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = constants.WEBSITE_URL + $(el).find(constants.FIGURE_IMG).attr("src");
            animeList.push(anime);
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).find("a").text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»" && display != "") {
                button.display = display;
                button.url = constants.WEBSITE_URL + $(el).find("a").attr("href");
                listNavigation.push(button);
            }
        });

        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    });
}

exports.getAnimeInfo = (req, res) => {
    cloudscraper.get(req.body.animeUrl).then((body) => {
        var $ = cheerio.load(body);
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], related: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
        animeInfo.title = $("h1").eq(0).text();
        animeInfo.description = $("p.sinopsis").eq(0).text().trim();
        animeInfo.imageUrl = constants.WEBSITE_URL + $("div.thumb img").attr("src");

        try {
            const episodeList = JSON.parse(body.split("var episodes = ")[1].split(";")[0]);
            const episodeDates = JSON.parse(body.split("var episodes_details = ")[1].split(";")[0]);

            for (let index = 0; index < episodeList.length; index++) {
                animeInfo.chapterList.push({
                    chapter: episodeList[index],
                    date: episodeDates[index],
                    chapterNumber: episodeList[index],
                    chapterUrl: req.body.animeUrl.replace("/anime/", "/ver/") + "-" + episodeList[index]
                });
            }
        } catch (error) {
            console.log(error)
        }

        var relatedAnimeList = $("section.w-history ul li");
        if (relatedAnimeList && relatedAnimeList.length > 0) {
            relatedAnimeList.each((idx, el) => {
                let title = $(el).find("h3").text().trim();
                animeInfo.related.push(
                    {
                        url: constants.WEBSITE_URL + $(el).find("a").attr("href"),
                        name: title
                    });
            });
        }

        var genreListHtml = $("p.genres span");
        genreListHtml.each((_idx, el) => {
            animeInfo.genreList.push({ genre: $(el).text().trim() });
        });

        // animeInfo.chapterList = animeInfo.chapterList.reverse()

        res.send(animeInfo)
    }, (err) => {
        res.send(err)
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
        animeInfo.title = $(".anime-title").text();


        try {

            var breadcrumbHtml = $("div.episodes-nav span");
            breadcrumbHtml.each((idx, el) => {
                if (idx == 2) {
                    animeInfo.animeUrl = constants.WEBSITE_URL + $(el).find("a").attr("href");
                }
            })

            const serverList = JSON.parse(body.split("var videos = ")[1].split(";")[0]);

            for (let index = 0; index < serverList.length; index++) {
                const serverObject = serverList[index];

                animeInfo.servers.push(
                    {
                        "server": serverObject[0],
                        "url": serverObject[1]
                    }
                )
            }
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

