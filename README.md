# ForceServer

ForceServer is a simple development server aimed at providing a simple and integrated developer experience when building applications that use Salesforce OAuth and REST services. ForceServer provides two main features:

- **A Proxy Server** to avoid cross-domain policy issues when invoking Salesforce REST services. (The Chatter API supports CORS, but other APIs don’t yet)
- **A Local Web Server** to (1) serve the OAuth callback URL defined in your Connected App, and (2) serve the whole app during development and avoid cross-domain policy issues when loading files (for example, templates) from the local file system.

## Installing ForceServer

Open a command prompt and type:

```
npm install -g force-server
```

or (Unix-based systems)

```
sudo npm install -g force-server
```

## Sample App

Create a file named index.html anywhere on you file system:

```
<html>
<body>
<ul id="list"></ul>
<script src="http://ccoenraets.github.io/forcejs/force.js"></script>
<script>
force.login(function() {
    force.query('select id, Name from contact LIMIT 50', function (response) {
        var str = '';
        for (var i = 0; i < response.records.length; i++) {
            str += '<li>' + response.records[i].Name + '</li>';
        }
        document.getElementById('list').innerHTML = str;
    });
});
</script>
</body>
</html>
```

Code Highlights:

1. The sample application above uses the <a href="">ForceJS</a> library. ForceJS and ForceServer are built to work closely together and provide an integrated developer experience.
1. ForceJS uses a default connected app: No need to create a connected app to start development. You should however create your own connected app for production use.
1. ForceServer automatically serves the OAuth callback URL: No need to create a callback HTML page during development.


## Run the Server

Navigate to the directory where you created index.html, and type:

```
force-server
``` 
    
This command will start the server on port 8200, and automatically load your app (http://localhost:8200) in a browser window. You'll see the Salesforce login window, and the list of contacts will appear after you log in.

You can change the port number and the web root. Type the following command for more info:

```
force-server --help
```

## Uninstalling the CLI

To uninstall the CLI:
    
```
npm -g rm force-server
```

or 

```
sudo npm -g rm force-server
```

## Deploying ForceServer to Heroku 

ForceServer is CORS-enabled. Instead of running it locally as a development server, you can deploy it to Heroku as your Proxy Server. Click the button below to deploy ForceServer to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

To use the Proxy Server deployed to Heroku, call the force.init() function before force.login() and specify your Proxy URL. For example, if the Heroku app you just created is **myproxy**:

```
force.init({
    proxyURL: 'https://myproxy.herokuapp.com'
});
```

