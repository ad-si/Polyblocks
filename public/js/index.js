!function (window, document) {

var socket

// TODO: uncomment
socket = io.connect('http://localhost:8000')

polyblocks(socket)

}(window, document)

