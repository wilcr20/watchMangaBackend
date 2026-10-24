const cheerio = require("cheerio");
const constants = require("./selectors")
const request = require('request');
const axios = require('axios');

exports.home = async (_, res) => {

    try {
        const response = await axios.get(constants.WEBSITE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_HOME);
        var animeList = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", chapterNumber: null, website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").eq(0).attr("href")?.trim();

            anime.title = $(el).find("h3").text()?.trim();
            anime.chapterNumber = $(el).find("span.aniyt-card-code").text()?.trim().replace('EP ', '');
            anime.imageUrl = $(el).find("img").attr("data-srcset")?.split(",")[0] || null;
            animeList.push(anime);

        });
        if (animeList) {
            res.send({ data: animeList, count: animeList.length });
        }
    }
    catch (error) {
        res.send(error);
    }
}


exports.getAnimeInfo = async (req, res) => {

    try {
        const response = await axios.get(req.body.animeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        const animeInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: constants.WEBSITE_NAME }
        animeInfo.title = $("h1.aniyt-series-title-line").eq(0).text();
        animeInfo.description = $(".aniyt-detail-synopsis").eq(0).text().trim();
        animeInfo.imageUrl = $(".aniyt-detail-poster img").attr("data-src");

        var chapterListHtml = $(".aniyt-episode-grid article");
        chapterListHtml.each((_idx, el) => {
            animeInfo.chapterList.push({
                chapter: $(el).find(".aniyt-episode-body a").text().trim(),
                date: $(el).find(".aniyt-episode-card-meta time").text().trim(),
                chapterNumber: chapterListHtml.length - _idx,
                chapterUrl: $(el).find(".aniyt-episode-body a").attr("href")
            });
        });

        $('dl.aniyt-meta-list dt:contains("Géneros")')
            .next('dd')
            .find('a')
            .each((_i, element) => {
                animeInfo.genreList.push($(element).text().trim());
            });

        if (animeInfo) {
            res.send({ data: animeInfo });
        }
    }
    catch (error) {
        res.send(error);
    }


}

exports.SeeChapter = async (req, res) => {

    try {
        const response = await axios.get(req.body.animeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        const animeInfo = { title: "", date: "", description: "", defaultPlayer: "", animeUrl: "", servers: [], website: constants.WEBSITE_NAME }

        animeInfo.description = $(".aniyt-watch-synopsis-scroll").find('p').eq(0).text().trim();
        animeInfo.date = null;
        animeInfo.title = $('h1.aniyt-watch-post-title').text().trim();
        animeInfo.animeUrl = $('.aniyt-watch-series-poster').attr('href');

        var iframeUrl = $(".aniyt-player-stage").find('iframe').eq(0).attr('data-src') || null;
        animeInfo.servers.push(
            {
                "server": 'Defaut',
                "url": iframeUrl
            }
        )

        if (animeInfo.servers && animeInfo.servers.length > 0) {
            animeInfo.defaultPlayer = animeInfo.servers[0].url;
        }

        if (animeInfo) {
            res.send({ data: animeInfo });
        }
    }
    catch (error) {
        res.send(error);
    }


}

exports.search = async (req, res) => {
    try {
        const response = await axios.get(req.body.term, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];
        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find(".aniyt-anime-body a").attr("href").trim();
            anime.title = $(el).find(".aniyt-anime-body a").text().trim();
            anime.imageUrl = $(el).find(".aniyt-anime-poster img").attr("srcset").split(',')[0] || null;
            animeList.push(anime);
        });

        var buttonsNavigationHTMl = $(".nav-links .page-numbers");
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            button.display = $(el).text().trim().replace(/\n/g, '');
            button.url = $(el).attr("href");
            listNavigation.push(button);

        });

        res.send({ data: animeList, buttons: listNavigation });
    }
    catch (error) {
        res.send(error);
    }

}


exports.directory = async (req, res) => {

    try {
        const response = await axios.get(req.body.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        var listNavigation = [];

        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find(".aniyt-anime-body h3").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("data-src");
            animeList.push(anime);
        });

        var buttonsNavigationHTMl = $(".nav-links .page-numbers");
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            button.display = $(el).text().trim().replace(/\n/g, '');
            button.url = $(el).attr("href");
            listNavigation.push(button);
        });

        res.send({ data: animeList, buttons: listNavigation });
    }
    catch (error) {
        res.send(error);
    }

}


exports.filterSearch = async (req, res) => {
    try {
        const response = await axios.get(req.body.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $(constants.DIV_LIST_ANIMES);
        var animeList = [];
        var listNavigation = [];

        listItems.each((_idx, el) => {
            var anime = { title: "", imageUrl: "", url: "", website: constants.WEBSITE_NAME };
            anime.url = $(el).find("a").attr("href")?.trim();
            anime.title = $(el).find(".aniyt-anime-body h3").text()?.trim().replace(/\n/g, '');
            anime.imageUrl = $(el).find("img").attr("data-src");
            animeList.push(anime);

        });
        var buttonsNavigationHTMl = $(".nav-links .page-numbers");
        buttonsNavigationHTMl.each((_idx, el) => {
            var button = { display: null, url: null };
            button.display = $(el).text().trim().replace(/\n/g, '');
            button.url = $(el).attr("href");
            listNavigation.push(button);

        });
        res.send({ data: animeList, buttons: listNavigation });
    }
    catch (error) {
        res.send(error);
    }

}