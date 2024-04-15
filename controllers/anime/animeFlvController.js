const cheerio = require("cheerio");
const cloudscraper = require('cloudscraper');


exports.home = (_, res) => {
    cloudscraper.get('https://www3.animeflv.net/').then((body) => {
        var $ = cheerio.load(body);
        let listItems = $("ul.ListEpisodios li");
        var animeList = [];
        listItems.each((_idx, el) => {

            var anime = { title: "", imageUrl: "", url: "", website: "animeflv" };
            anime.url = "https://www3.animeflv.net"+ $(el).find("a").attr("href");
            let chapterNumber = $(el).find("a span.Capi").text();
            if(chapterNumber){

            }
            anime.title = $(el).find("a strong").text().replace(/\n/g, '') + " "+ chapterNumber;
            anime.imageUrl = "https://www3.animeflv.net"+ $(el).find("a img").attr("src").replace("?resize=200,200", "");
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
        let listItems = $("ul.ListAnimes article.Anime");
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $("div.NvCnAnm ul.pagination li");
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeflv" };
            anime.url = "https://www3.animeflv.net" + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("figure img").attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).find("a").text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»") {
                button.display = display;
                button.url = "https://www3.animeflv.net" + $(el).find("a").attr("href");
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
        let listItems = $("ul.ListAnimes article.Anime");
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $("ul.pagination li:not(.active)");
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeflv" };
            anime.url = "https://www3.animeflv.net" + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("figure img").attr("src");
            animeList.push(anime);
        });
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).find("a").text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»" && display != "") {
                button.display = display;
                button.url = "https://www3.animeflv.net" + $(el).find("a").attr("href");
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
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], related: [], chapterList: [], state: "", website: "animeflv" }
        animeInfo.title = $("div.Container h1").text();
        animeInfo.description = $("div.Description").text().trim();
        animeInfo.imageUrl = "https://www3.animeflv.net" + $("div.AnimeCover").find("figure img").attr("src");
        var relatedAnimeList = $("ul.ListAnmRel li");
        if (relatedAnimeList && relatedAnimeList.length > 0) {
            relatedAnimeList.each((idx, el) => {
                let type = $(el).text();
                animeInfo.related.push(
                    {
                        url: "https://www3.animeflv.net" + $(el).find("a").attr("href"),
                        name: type
                    });
            });
        }
        try {
            let listChapters = JSON.parse(body.split("var episodes =")[1]?.split("var last_seen = 0")[0]?.trim()?.replace(";", ""))
            let animeInfoList = JSON.parse(body.split("var anime_info =")[1]?.split(";")[0]);
            if(animeInfoList[3]){
                animeInfo.chapterList.push({
                    chapter: "Próximo capítulo: " + animeInfoList[3],
                    date: null,
                    chapterUrl: null
                });
            }
            for (let index = 0; index < listChapters.length; index++) {
                const element = listChapters[index];
                animeInfo.chapterList.push({
                    chapter: "Capítulo " + element[0],
                    date: null,
                    chapterUrl: req.body.animeUrl.replace("https://www3.animeflv.net/anime", "https://www3.animeflv.net/ver") + "-" + element[0]
                });

            }
        } catch (error) {
            console.log(error);
        }

        var genreListHtml = $("nav.Nvgnrs a");
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
        const animeInfo = { title: "", date: null, description: null, defaultPlayer: "", servers: [], website: "animeflv" }
        let listServer = JSON.parse(body.split('{"SUB":')[1]?.split("};")[0].trim().replace(";", ""))
        var breadcrumbHtml = $("nav.Brdcrmb a");
        breadcrumbHtml.each((idx, el) => {
            if (idx == 1) {
                animeInfo.animeUrl = "https://www3.animeflv.net" + $(el).attr("href");
                animeInfo.title = $(el).text();
            }
        })

        for (let index = 0; index < listServer.length; index++) {
            const server = listServer[index];
            animeInfo.servers.push(
                {
                    "server": server.title,
                    "url": server.code
                }
            )
        }
        animeInfo.defaultPlayer = animeInfo.servers[0].url;
        res.send(animeInfo)
    }, (err) => {
        res.send(err)
    })
}


exports.movies = (req, res) => {
    var options = {
        uri: req.body.url,   // "https://www3.animeflv.net/browse?type%5B%5D=movie&order=added"
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {

        var $ = cheerio.load(body);
        let listItems = $("ul.ListAnimes article.Anime");
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $("div.NvCnAnm ul.pagination li");
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeflv" };
            anime.url = "https://www3.animeflv.net" + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("figure img").attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).find("a").text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»") {
                button.display = display;
                button.url = "https://www3.animeflv.net" + $(el).find("a").attr("href");
                listNavigation.push(button);
            }

        });

        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    });
}

exports.ongoing = (req, res) => {
    var options = {
        uri: req.body.url,  //"https://www3.animeflv.net/browse?status%5B%5D=1&order=default",  
        timeout: 10000
    }
    cloudscraper.get(options).then((body) => {

        var $ = cheerio.load(body);
        let listItems = $("ul.ListAnimes article.Anime");
        var animeList = [];
        var listNavigation = [];

        var buttonsNavigationHTMl = $("div.NvCnAnm ul.pagination li");
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: "animeflv" };
            anime.url = "https://www3.animeflv.net" + $(el).find("a").attr("href").trim();
            anime.title = $(el).find("h3").text().trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("figure img").attr("src");
            animeList.push(anime);
        });

        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            let display = $(el).find("a").text().trim().replace(/\n/g, '');
            if (display !== "«" && display !== "»") {
                button.display = display;
                button.url = "https://www3.animeflv.net" + $(el).find("a").attr("href");
                listNavigation.push(button);
            }

        });

        res.send({ data: animeList, buttons: listNavigation });
    }, (err) => {
        res.send(err)
    });
}
