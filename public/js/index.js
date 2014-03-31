!function (window, document) {

var socket

// TODO: uncomment
socket = io.connect()

polyblocks(socket, document.getElementById('canvas'))

}(window, document)
