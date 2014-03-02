
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var settings = require('./settings.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var basicAuth = express.basicAuth(function (username, password) {
	return username == settings.passname && password == settings.passcode;
}, "Aha! Say the passcode!");

app.get('/', routes.index);
app.post('/charge', basicAuth, routes.charge);
app.get('/detail/:email', routes.detail);
app.post('/detail/:email', basicAuth, routes.update);
app.get('/delete/:email', routes.delete);
app.get('/add', routes.add);
app.post('/add', basicAuth, routes.doAdd);
app.get('/email', routes.email);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});