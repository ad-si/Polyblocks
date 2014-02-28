!function (window, document) {

	window.polyblocks = function (socket) {


		var keymap = {
				up: function () {
					socket.emit('up')
				},
				down: function () {
					socket.emit('down')
				},
				right: function () {
					socket.emit('right')
				},
				left: function () {
					socket.emit('left')
				},
				space: function () {
					socket.emit('right')
				}
			},
			i


		function render(data) {

			var canvas = document.getElementById('canvas'),
				stage = new createjs.Stage(canvas),
				pixelSize = 10

			data.forEach(function (column, x) {
				column.forEach(function (pixel, y) {

					var rect = new createjs.Shape()

					rect
						.graphics
						.beginFill('rgba(' + Math.round(Math.random() * 255) + ',0,0,1)')
						.rect(pixelSize * x, pixelSize * y, pixelSize, pixelSize)

					stage.addChild(rect)
					stage.update()
				})
			})


		}


		/* TODO: uncomment
		 socket.on('base', function (data) {

		 render(data)
		 })
		 */


		for (var key in keymap)
			if (keymap.hasOwnProperty(key))
				Mousetrap.bind(key, keymap[key])


		// TODO: delete
		render([
			[
				{
					type: 1,
					id: 1,
					name: 'dustin'
				},
				{
					type: 1,
					id: 1,
					name: 'dustin'
				}
			],
			[
				{
					type: 2,
					id: 1,
					name: 'dustin'
				},
				{
					type: 2,
					id: 1,
					name: 'dustin'
				}
			],
		])
	}

}(window, document)
