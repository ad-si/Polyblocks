const express = require('express')
const	http = require('http')
const	path = require('path')
const	socketio = require('socket.io')
const	polyblocks = require('./routes/polyblocks')
const	ban = require('./routes/ban')
const	stylus = require('stylus')
const	nib = require('nib')

const	app = express()
const server = http.createServer(app)
const	io = new socketio.Server(server)
const	devMode = (app.get('env') === 'development')

function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.set('compress', !devMode)
		.use(nib())
		.import('nib')
}

// all environments
app.set('port', process.env.PORT || 9014)
app.use(ban.ban)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(stylus.middleware({
	src: __dirname + '/public',
	compile: compile
}))
app.all('/reset', polyblocks.reset)
app.use(express.static(path.join(__dirname, 'public')))

polyblocks.init(io)

server.listen(app.get('port'), function () {
	console.log(
		`Polyblocks server listening on http://localhost:${app.get('port')}`
	)
})
