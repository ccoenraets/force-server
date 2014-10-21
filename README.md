# force-server

force-server is a simple development server for Force.com. It provides two main features:

- **A Proxy Server**: allows you to avoid cross domain policy issues when making REST API calls to Salesforce
- **A Local Web Server**: allows you to avoid cross domain policy issues when loading application resources using XMLHTTPRequest (templates, etc.) 

There are different options to use force-server:

## Option 1: Install as a CLI

1. Install the force-server CLI

    ```
    npm install -g force-server
    ```
    
    or (Unix-based systems)

    ```
    sudo npm install -g force-server
    ```

1. Start the server

    ```
    force-server [path] [port]
    ``` 
    
    - **path**: path to the web root directory relative to the current directory. The default is the current directory.
    - **port**: server port number. The default is 5000.     

    Examples:

    To start force-server on port 5000 (default) and serve files in the current directory:
    ```
    force-server
    ```

    To start force-server on port 5000 (default) and serve files in the **www** directory (relative to the current directory):
    ```
    force-server www
    ```

    To start force-server on port 8000 and serve files in the **www** directory (relative to the current directory):
    ```
    force-server www 8000
    ```

## Option 2: Install a local version

1. Clone this repository

    ```
    git clone https://github.com/ccoenraets/force-server
    ```

1. Navigate to the force-server directory

    ```
    cd force-server
    ```

1. Install the server dependencies

   ```
   npm install
   ```

1. Start the server
    
    ```
    node server [path] [port]
    ```


## Option 3: Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Because force-server is itself CORS-enabled, your application and the proxy don't have to be hosted on the same 
domain.

## Proxy Server Usage

When making an API call using JavaScript (using XMLHTTPRequest, $.ajax, etc):

1. Substitute the actual service URL with the Proxy URL 

1. Set the request method, query parameters, and body as usual

1. Set the actual service URL in a header named 'Target-Endpoint'

1. Send the request as usual

These steps are automated when using the [ForceJS](https://github.com/ccoenraets/forcejs) REST Library

## Uninstalling the CLI

To uninstall the CLI:
    
```
npm -g rm force-server
```

or 

```
sudo npm -g rm force-server
```

## Related Project

[ForceJS](https://github.com/ccoenraets/forcejs) is a REST Library for Force.com that works together with force-server to provide an integrated devlopment experience when building apps that connect to Salesforce using REST services.
