var express = require("express");
var app = express();

var request = require("request");
var URI = require("URIjs");
var YQL = require("yql");

app.set("port", (process.env.PORT || 3000));
app.use(express.static(__dirname + "/public"));

/*app.use(function(req, res, next) {
    res.append("Content-Type", "text/plain");
    next();
});*/

app.get("/", function(req, res) {
    res.send("<style>pre { display: inline; }</style>Send a <pre>GET</pre> request to <a href='/fetch?url=http://example.com'><pre>/fetch</pre></a> with parameter <pre>url</pre> defining the url to fetch.");
});

app.get("/fetch", function(req, res) {
    if (req.query && req.query.url) {
        var url = req.query.url;
        
        var object = {};
        
        var linkQuery = new YQL("select * from html where url='" + url + "' and xpath='//link[contains(@rel, \"icon\")]'");
        linkQuery.exec(function(err, result) {
            var sizePreference = ["57x57", "60x60", "72x72", "76x76", "96x96", "114x114", "120x120", "144x144", "152x152", "180x180", "192x192"];
            var icons = result.query.results.link;

            icons.sort(function(a, b){
                var sizeA = a.sizes;
                var sizeB = b.sizes;
                if (sizePreference.indexOf(sizeA) > sizePreference.indexOf(sizeB)) return -1;
                if (sizePreference.indexOf(sizeA) < sizePreference.indexOf(sizeB)) return 1;
                return 0;
            });

            icons = icons.map(function(icon){
                return URI(icon.href).absoluteTo(url).toString();
            });

            object.icon = icons;

            res.append("Content-Type", "application/json");
            res.send(JSON.stringify(object));
        });
    }
});

app.listen(app.get("port"), function() {
  console.log("metafetch running on port " + app.get("port"));
});