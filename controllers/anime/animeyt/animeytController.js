const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');
const constants = require("./selectors")
const request = require('request');


exports.home = (_, res) => {
    let options = {
        url: constants.WEBSITE_URL,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    };

    try {
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
                let listItems = $(constants.DIV_LIST_HOME);
                var animeList = [];
                listItems.each((_idx, el) => {
                    let type = $(el).find(constants.DIV_TYPE).text();
                    if (type != "Próximamente") {
                        var anime = { title: "", imageUrl: "", url: "", chapterNumber: null, website: constants.WEBSITE_NAME };
                        anime.url = $(el).find("a").attr("href")?.trim();
                        let chapterTitle = $(el).find("h2").text()?.trim().replace(/\n/g, '');

                        anime.title = chapterTitle.split(" Capitulo ")[0] || "";
                        anime.chapterNumber = chapterTitle.split(" Capitulo ")[1] || null;
                        anime.imageUrl = $(el).find("img").attr("src");
                        animeList.push(anime);
                    }
                });
                if (animeList) {
                    res.send({ data: animeList });
                }
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }


}


exports.getAnimeInfo = (req, res) => {
    let options = {
        url: req.body.animeUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    };

    try {
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
                const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
                animeInfo.title = $("h1.entry-title").eq(0).text();
                animeInfo.description = $("div.entry-content").eq(0).text().trim();
                animeInfo.imageUrl = $("div.thumb img").attr("src");
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

                if (animeInfo) {
                    res.send({ data: animeInfo });
                }
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

exports.SeeChapter = (req, res) => {
    let options = {
        url: req.body.animeUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    };

    try {
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
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

                if (animeInfo) {
                    res.send({ data: animeInfo });
                }
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

exports.search = (req, res) => {
    let options = {
        url: req.body.term,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    };


    try {
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
                let listItems = $(constants.DIV_LIST_ANIMES);
                var animeList = [];
                var buttonsNavigationHTMl = $("div.hpage a");
                var listNavigation = [];
                listItems.each((_idx, el) => {
                    var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
                    anime.url = $(el).find("a").attr("href").trim();
                    anime.title = $(el).find("a").attr("title").trim().replace(/\n/g, '');
                    anime.imageUrl = $(el).find("img.ts-post-image").attr("src").replace("?h=300", "");
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
                // if (animeList) {
                //     res.send({ data: animeList });
                // }
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

}


exports.directory = (req, res) => {

    let options = {
        url: req.body.url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    };


    try {
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
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
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.filterSearch = (req, res) => {
    let options = {
        url: req.body.url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
    };


    try {
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
                let listItems = $(constants.DIV_LIST_ANIMES);
                var animeList = [];
                var buttonsNavigationHTMl = $("div.hpage a");
                var listNavigation = [];

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
                    button.display = display;
                    button.url = "https://animeytx.net/tv/" + $(el).attr("href");
                    listNavigation.push(button);

                });
                res.send({ data: animeList, buttons: listNavigation });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

}