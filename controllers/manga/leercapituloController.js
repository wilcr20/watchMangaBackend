const cheerio = require("cheerio");
const axios = require('axios');

exports.home = async (_, res) => {
    try {
        const response = await axios.get("https://leercapitulo.com", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $("main#contenido div.container article");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "leercapitulo" };
            manga.title = $(el).find("a.lc-release-title").text();
            manga.imageUrl = "https://www.leercapitulo.com" + $(el).find("img").attr("src");
            manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find("a.lc-release-title").attr("href");
            manga.date = getTranslatedDate($(el).find(".lc-chapter-list").find(".lc-chapter-time").eq(0).text() || '');
            mangaList.push(manga);
        });
        res.send({ data: mangaList, count: listItems.length });
    }
    catch (error) {
        res.send(error);
    }
}


exports.trends = async (_, res) => {
    try {
        const response = await axios.get("https://leercapitulo.com", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $("div.lc-slider-track div.lc-slide");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "leercapitulo" };
            manga.title = $(el).find(".lc-slide-name").text();
            manga.imageUrl = "https://www.leercapitulo.com" + $(el).find("img").attr("src");
            manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find(".lc-slide-name").attr("href");
            manga.date = null;
            mangaList.push(manga);
        });
        res.send({ data: mangaList, count: listItems.length });
    }
    catch (error) {
        res.send(error);
    }
};

exports.search = async (req, res) => {
    try {
        // https://www.leercapitulo.co/manga/?q=
        const response = await axios.get(req.query.searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $("main#contenido div.container article");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "leercapitulo" };
            manga.title = $(el).find(".lc-card-name").text();
            manga.imageUrl = "https://www.leercapitulo.com" + $(el).find("img").attr("src");
            manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find(".lc-card-name").attr("href");
            manga.date = null;
            mangaList.push(manga);
        });

        var paginationList = [];
        var paginationListHtml = $(".pagination>li").not(".active, .disabled");
        paginationListHtml.each((_idx, el) => {
            paginationList.push({ page: $(el).text().trim(), pageUrl: "https://www.leercapitulo.com" + $(el).find("a").attr("href") });
        });

        res.send({ data: mangaList, paginationList: paginationList, count: listItems.length });
    }
    catch (error) {
        res.send(error);
    }

}

exports.mangaInfo = async (req, res) => {
    try {
        const response = await axios.get(req.body.mangaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });

        const body = response.data;
        var $ = cheerio.load(body);
        const mangaInfo = { title: "", description: "", imageUrl: "", genreList: [], chapterList: [], state: "", website: "leercapitulo" }
        mangaInfo.title = $(".container").find("h1").text();
        mangaInfo.description = $("#sinopsis .p-3 p.mb-0").text().trim();
        mangaInfo.imageUrl = "https://www.leercapitulo.com" + $(".lc-cover-lg").eq(0).find("img").attr("src");

        var chapterListHtml = $("#chapterList a");
        chapterListHtml.each((_idx, el) => {
            mangaInfo.chapterList.push({ chapter: $(el).find(".n").text().trim(), chapterUrl: "https://www.leercapitulo.com" + $(el).attr("href") });
        });

        var genreListHtml = $("a.badge");
        genreListHtml.each((_idx, el) => {
            mangaInfo.genreList.push({ genre: $(el).text().trim() });
        });
        var state = $("ul.lc-facts li a").eq(0).text().replace(/\n/g, '');
        mangaInfo.state = state.split(",").reverse()[0].trim();
        res.send(mangaInfo)
    }
    catch (error) {
        res.send(error);
    }


}

exports.searchByGenre = async (req, res) => {
    // https://www.leercapitulo.com/manga/?genre=
    try {
        const response = await axios.get(req.body.searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            },
            timeout: 10000
        });
        console.log()

        const body = response.data;
        var $ = cheerio.load(body);
        let listItems = $("main#contenido article.lc-card");
        var mangaList = [];
        listItems.each((_idx, el) => {
            const manga = { title: "", imageUrl: "", date: "", mangaUrl: "", website: "leercapitulo" };
            manga.title = $(el).find(".lc-card-name").text();
            manga.imageUrl = "https://www.leercapitulo.com" + $(el).find("img").attr("src");
            manga.mangaUrl = "https://www.leercapitulo.com" + $(el).find(".lc-card-name").attr("href");
            manga.date = null;
            mangaList.push(manga);
        });

        var paginationList = [];
        var paginationListHtml = $(".pagination>li").not(".active, .disabled");
        paginationListHtml.each((_idx, el) => {
            paginationList.push({ page: $(el).text().trim(), pageUrl: "https://www.leercapitulo.com" + $(el).find("a").attr("href") });
        });

        res.send({ data: mangaList, paginationList: paginationList });
    }
    catch (error) {
        res.send(error);
    }
}

function getTranslatedDate(datetext) {
    const translations = {
        "week": "semana",
        "weeks": "semanas",
        "day": "día",
        "days": "días",
        "hour": "hora",
        "hours": "horas",
        "min": "min",
        "mins": "mins"
    };
    const regex = new RegExp(Object.keys(translations).join("|"), "g");
    return "Hace " + datetext.replace(regex, (word) => translations[word]);
}