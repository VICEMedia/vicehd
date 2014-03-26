var express = require('express');
var http = require('http');
// Authentication module.
var auth = require('http-auth');
var basic = auth.basic({
		realm: "Vice HD"
	}, function (username, password, callback) { // Custom authentication method.
		callback(username === "vice" && password === "welcome");
	}
);

var app = express();
app.use(auth.connect(basic));

[ 'settings'
, 'middleware'
, 'routes'
, 'db'].forEach(function (i) {
  require('./config/'+i).configure(app);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('App running at "' + app.get('host') + '" (port:'+app.get('port')+')');
});
