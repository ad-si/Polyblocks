var express = require('express'),
	http = require('http'),
	path = require('path'),
	socketio = require('socket.io'),
	polyblocks = require('./routes/polyblocks'),
	stylus = require('stylus'),
	nib = require('nib'),

	app = express(),
	server = http.createServer(app),
	io = socketio.listen(server, {log: false}),
	devMode = true //app.get('env') == 'development'

function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.set('compress', !devMode)
		.use(nib())
		.import('nib')
}

// all environments
app.set('port', process.env.PORT || 8000)
app.use(express.favicon())
app.use(express.compress())
// app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
app.use(stylus.middleware({
	src: __dirname + '/public',
	compile: compile
}))
app.use(express.static(path.join(__dirname, 'public')))

if (devMode) app.use(express.errorHandler())


polyblocks.init(io.sockets)


server.listen(app.get('port'), function () {
	console.log('Polyblocks server listening on port ' + app.get('port'))
})
