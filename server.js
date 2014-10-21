var express = require('express'),
    path = require('path'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express(),
    webRoot = '',
    port = 5000,
    webRootFullPath;


if (process.argv[2]) {
    webRoot = process.argv[2];
} else if (process.env.ROOT) {
    webRoot = process.env.ROOT;
};

if (process.argv[3]) {
    port = process.argv[3];
} else if (process.env.PORT) {
    port = process.env.PORT;
};

webRootFullPath = path.join(process.cwd(), webRoot);

app.use(bodyParser.json());

app.use(express.static(webRootFullPath));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.status(500).send({ error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        request({ url: targetURL + req.url, method: req.method, json: req.body, headers: {'Authorization': req.header('Authorization')} },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
//                console.log(body);
            }).pipe(res);
    }
});

app.listen(port, function () {
    console.log('force-server listening on port ' + port);
    console.log('web root: ' + webRootFullPath);
});