!function (window, document) {

var socket

socket = io.connect()

polyblocks(socket, document.getElementById('htmlCanvas'))

}(window, document)
