var express = require('express'),
	http = require('http'),
	path = require('path'),
	socketio = require('socket.io'),
	polyblocks = require('./routes/polyblocks'),
	app = express(),
	server = http.createServer(app),
	io = socketio.listen(server, {log: false})

// all environments
app.set('port', process.env.PORT || 8000)
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// development only
if (app.get('env') == 'development') {
	app.use(express.errorHandler())
}

// routes
app.get('/', polyblocks.index)


polyblocks.init(io.sockets)


server.listen(app.get('port'), function () {
	console.log('Polyblocks server listening on port ' + app.get('port'))
})
