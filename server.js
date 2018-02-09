var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    multiparty = require('multiparty'),
    fs = require('fs'),
    open = require("open"),
    argv = require('minimist')(process.argv.slice(2)),
    app = express(),
    root = argv.r || argv.root || process.env.ROOT || '.',
    port = argv.p || argv.port || process.env.PORT || '8200',
    debug = argv.d || argv.debug || process.env.DEBUG || false;

if (argv.h || argv.help) {
    console.log('USAGE Example:');
    console.log('force-server --port 8200 --root /users/chris/projects --debug');
    return;
}


app.use(bodyParser.json());

// Server application
app.use(express.static(root));

// Serve default oauthcallback.html during development if one is not available in root
app.use(express.static(__dirname + '/oauth'));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else if (req.body && req.body.grant_type === 'refresh_token') {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.status(500).send({ error: 'Resource Not Found (Web Server) or no Target-URL header in the request (Proxy Server)' });
            return;
        }
        var url = targetURL + req.url;
        if (debug) console.log(req.method + ' ' + url);
        if (debug) console.log('Request body:');
        if (debug) console.log(req.body);
        request({ url: url, method: req.method, json: req.body },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
                if (debug) console.log('Response body:');
                if (debug) console.log(body);
            }).pipe(res);
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.status(500).send({ error: 'Resource Not Found (Web Server) or no Target-URL header in the request (Proxy Server)' });
            return;
        }
        var url = targetURL + req.url;
        if (debug) console.log(req.method + ' ' + url);
        if (debug) console.log('Request body:');
        if (debug) console.log(req.body);
        if (debug) console.log('Content type:');
        if (debug) console.log(req.get('content-type'));

        if (!req.is('multipart/form-data')) {
            request({ url: url, method: req.method, json: req.body, headers: {'Authorization': req.header('Authorization')} },
                function (error, response, body) {
                    if (error) {
                        console.error('error: ' + response.statusCode)
                    }
                    if (debug) console.log('Response body:');
                    if (debug) console.log(body);
                }).pipe(res);
        } else {
            var form = new multiparty.Form({autoFiles: true});
            var formData = {};
            form.on('error', function(err) {
              console.log('Error parsing form: ' + err.stack);
            });
            
            form.on('field', function(name, value) {
                formData[name] = {
                    value: value,
                    options: {
                        contentType: 'application/json'
                    }
                };
            });

            form.on('file', function(name, file) {
                formData[name] = {
                    value: fs.createReadStream(file.path),
                    options: {
                        filename: file.originalFilename,
                        contentType: file.headers['content-type']
                    }
                };
            });
             
            // Close emitted after form parsed 
            form.on('close', function() {
                request({ url: url, method: req.method, formData: formData, headers: {'Authorization': req.header('Authorization'), 'Content-Type': req.get('content-type')} },
                    function (error, response, body) {
                        if (error) {
                            console.error('error: ' + response.statusCode)
                        }
                        if (debug) console.log('Response body:');
                        if (debug) console.log(body);
                    }).pipe(res);
            });
             
            // Parse req 
            form.parse(req);      
        }
    }
});

app.listen(port, function () {
    console.log('force-server listening on port ' + port);
    console.log('Root: ' + root);
    open("http://localhost:" + port);
});