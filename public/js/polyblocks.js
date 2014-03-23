!function (window, document) {

	window.polyblocks = function (socket, canvas) {


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
					socket.emit('space')
				}
			},
			i


		function render(data) {

			var canvas = document.getElementById('canvas'),
				stage = new createjs.Stage(canvas),
				pixelSize = 14

			canvas.setAttribute('width', String(pixelSize * data.field[0].length))
			canvas.setAttribute('height', String(pixelSize * data.field.length))

			data.players.forEach(function(player){

				var x = player.position[0],
					y = player.position[1],
					matrix = rotateMatrix(shared.types[player.type], player.rotation),
					dx,
					dy

				for (dy = 0; dy < matrix.length; dy++)
					for (dx = 0; dx < matrix[0].length; dx++)
						if (matrix[dy][dx])
							data.field[dx + x][dy + y] = 1
			})

			data.field.forEach(function (column, x) {
				column.forEach(function (pixel, y) {

					var rect = new createjs.Shape(),
						color = (pixel)? 'rgb(255,50,50)' : null

					rect
						.graphics
						.beginFill(color)
						.rect(pixelSize * x, pixelSize * y, pixelSize, pixelSize)

					stage.addChild(rect)
					stage.update()
				})
			})


		}


		socket.on('base', function (data) {
			render(data)
		})


		for (var key in keymap)
			if (keymap.hasOwnProperty(key))
				Mousetrap.bind(key, keymap[key])


		// TODO: delete
		/*render([
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
			]
		])
		*/
	}

}(window, document)
