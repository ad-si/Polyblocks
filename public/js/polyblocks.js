!function (window, document) {

	window.polyblocks = function (socket, canvas) {


		var keymap = {
				up: function (event) {
					event.preventDefault()
					socket.emit('update', 'up')
				},
				down: function (event) {
					event.preventDefault()
					socket.emit('update', 'down')
				},
				right: function (event) {
					event.preventDefault()
					socket.emit('update', 'right')
				},
				left: function (event) {
					event.preventDefault()
					socket.emit('update', 'left')
				},
				space: function (event) {
					event.preventDefault()
					socket.emit('update', 'space')
				}
			},
			key,
			counter = 0,
			firstCall = true,
			i


		function render(data) {

			console.time('render')

			var pixelSize = 14,
				stage = new createjs.Stage(canvas)

			if (firstCall === true) {
				canvas.setAttribute('width', String(pixelSize * data.field[0].length))
				canvas.setAttribute('height', String(pixelSize * data.field.length))
				firstCall = false
			}

			data.players.forEach(function (player) {

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

					if (pixel) {
						var rect = new createjs.Shape(),
							color = 'rgb(255,50,50)'

						rect
							.graphics
							.beginFill(color)
							.rect(pixelSize * x, pixelSize * y, pixelSize, pixelSize)

						stage.addChild(rect)
						stage.update()

						console.timeEnd('render')
					}
				})
			})
		}


		for (key in keymap)
			if (keymap.hasOwnProperty(key))
				Mousetrap.bind(key, keymap[key])

		socket.on('base', function (data) {
			console.log('base received', counter++)
			render(data)
		})
	}

}(window, document)
