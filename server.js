var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    open = require("open"),
    argv = require('minimist')(process.argv.slice(2)),
    app = express(),

// Load settings
var root        = argv.r || argv.root || process.env.ROOT || '.',
    port        = argv.p || argv.port || process.env.PORT || '8200',
    debug       = argv.d || argv.debug || process.env.DEBUG || false,
    ssl         = argv.s || argv.ssl || false,
    ssl_key     = argv.sslkey || argv['ssl-key'] || 'ssl/server.key',
    ssl_cert    = argv.sslcert || argv['ssl-cert'] || 'ssl/server.crt',
    ssl_ca      = argv.sslca || argv['ssl-ca'] || 'ssl/ca.crt';
    
var credentials = (ssl ? {
    key: fs.readFileSync(root + '/' + ssl_key),
    cert: fs.readFileSync(root + '/' + ssl_cert),
    ca: fs.readFileSync(root + '/' + ssl_ca),
    requestCert: true,
    rejectUnauthorized: false
} : {});

if (argv.h || argv.help) {
    console.log('USAGE Example:');
    console.log('forceserver --port 8200 --root ~/projects/force-server --debug [--ssl --ssl-key server.key --ssl-cert server.crt --ssl-ca ca.crt]\n');
    console.log('ROOT\t\t-r, --root\t\tChange the root directory of running application. Default is .');
    console.log('PORT\t\t-p, --port\t\tSet the port to access server. Default is 8200');
    console.log('DEBUG\t\t-d, --debug\t\tShow debug of server when running. Disabled by default\n');
    console.log('SSL\t\t-s, --ssl\t\tEnable the SSL Mode. Disabled by default');
    console.log('SSL options:');
    console.log('\t\t-sslkey, --ssl-key\tSet the key. Default is ssl/server.key');
    console.log('\t\t-sslcert, --ssl-cert\tSet the cert. Default is ssl/server.crt');
    console.log('\t\t-sslca, --ssl-ca\tSet the ca. Default is ssl/ca.crt');
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
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.status(500).send({ error: 'Resource Not Found (Web Server) or no Target-Endpoint header in the request (Proxy Server)' });
            return;
        }
        var url = targetURL + req.url;
        if (debug) console.log(req.method + ' ' + url);
        if (debug) console.log('Request body:');
        if (debug) console.log(req.body);

        request({
            url: url, 
            method: req.method, 
            form: req.body, 
            headers: {
                'Authorization': req.header('Authorization'),
		'Content-type': 'application/x-www-form-urlencoded'
            }
        }, function (error, response, body) {
            if (error) {
                console.error('Error:' + response.statusCode);
            }
            if (debug) console.log('Response body:');
            if (debug) console.log(body);
        }).pipe(res);

    }
});

app.listen(port, function () {
    console.log('force-server listening on port ' + port);
    console.log('Root: ' + root);
    open("http://localhost:" + port);
});
