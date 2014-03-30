!function (window, document) {

var socket

// TODO: uncomment
socket = io.connect('http://169.254.214.182:8000')

polyblocks(socket, document.getElementById('canvas'))

}(window, document)
