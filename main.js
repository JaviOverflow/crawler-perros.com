var Crawler = require("node-webcrawler");
var fs = require('fs');

const START_URL = 'http://www.perros.com/nuestros-perros/{0}/?sexo=&raza=&pais=8&provincia=&localidad=';

const DOGS_JSON_PATH = 'dogs.json';
const DOMAIN = 'http://www.perros.com';

var dogs = [];
var amount_dogs_crawled = 0;
var total_dogs_to_crawl;

var dogsCrawler = new Crawler({
    maxConnections: 100,
    callback: function (error, result, $) {

        var dogNodes = $('.buscador-item');
        dogNodes.each(function (index, element) {

            amount_dogs_crawled += 1;
            console.log((amount_dogs_crawled/total_dogs_to_crawl * 100).toFixed(2) + "%");

            var imgUrl = DOMAIN + $(this).children().first().children().first().children().first().attr('src');
            var name = $(this).children().first().next().children().first().text().trim();

            dogs.push({
                name: name,
                image: imgUrl
            });
        });
    },
    onDrain: function (pool) {
        fs.writeFile(
            DOGS_JSON_PATH,
            JSON.stringify(dogs),
            function (err) {
                if (err)
                    console.error("Error: Could not save dogs to json.");
                else
                    console.log("Songs saved to '" + DOGS_JSON_PATH + "' file");
            }
        )
    }
});

var dogPagesCrawler = new Crawler({
    maxConnections: 10,
    callback: function (error, result, $) {
        total_dogs_to_crawl = $('.nuestras-mascotas-result-info').children().first().text().match(/\d+/)[0];

        var pagesToCrawl = $('.total').text().match(/\d+/)[0];

        for (var i = 1; i <= pagesToCrawl; i++)
            dogsCrawler.queue(START_URL.replace('{0}', i));

    }
});

dogPagesCrawler.queue(START_URL.replace('{0}', '1'));
