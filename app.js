var http = require('http');
var fs = require('fs');

var server = new http.Server();

server.on('request', function(req, res) {
  if (req.url == '/') {
    fs.readFile('index.html', function(err, data) {
      res.writeHead(200, {
        "Content-Type": "text/html"
      });
      res.end(data);
    });
  } else if (req.url == '/favicon.ico') {
    fs.readFile('Resources/favicons/Findhold-Karate-punch.ico', function(err, data) {
      res.writeHead(200, {
        "Content-Type": "image/x-icon"
      });
      res.end(data);
    });
  } else if (req.url.slice(-3) == 'png') {
    console.log('request to PNG file: ' + req.url);

    fs.readFile(req.url.slice(1), function(err, data) {
      res.writeHead(200, {
        "Content-Type": "image/png"
      });
      res.end(data);

    });

    /*res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    fs.createReadStream(req.url.slice(1)).pipe(res);*/

  }  else {
    fs.readFile(req.url.slice(1), function(err, data) {
      res.end(data);
    });
  }

  console.log(req.url);
});

server.listen(80);
