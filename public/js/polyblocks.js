!function (window, document) {

	window.polyblocks = function (socket, canvas) {


		var modifications = {
				rotateRight: function (event) {
					//event.preventDefault()
					socket.emit('update', 'up')
				},
				rotateLeft: function (event) {
					//event.preventDefault()
					socket.emit('update', 'down')
				},
				moveRight: function (event) {
					//event.preventDefault()
					socket.emit('update', 'right')
				},
				moveLeft: function (event) {
					//event.preventDefault()
					socket.emit('update', 'left')
				},
				moveDown: function (event) {
					//event.preventDefault()
					socket.emit('update', 'space')
				}
			},
			keymap = {
				up: modifications.rotateRight,
				right: modifications.moveRight,
				down: modifications.rotateLeft,
				left: modifications.moveLeft,
				space: modifications.moveDown
			},
			touchMap = {
				swipeup: modifications.rotateRight,
				dragup: modifications.rotateRight,
				tap: modifications.rotateRight,

				swipedown: modifications.moveDown,
				dragdown: modifications.moveDown,

				swiperight: modifications.moveRight,
				dragright: modifications.moveRight,

				swipeleft: modifications.moveLeft,
				dragleft: modifications.moveLeft
			},
			key,
			gesture,
			counter = 0,
			firstCall = true,
			i


		function render(data) {

			var pixelSize = 14,
			//stage = new createjs.Stage(canvas),
				$htmlCanvas = $('#htmlCanvas')


			function drawOnCanvas(x, y, pixel) {

				var rect = new createjs.Shape(),
					colorArray = [
							(pixel.owner * 100) % 360,
							60 + ((pixel.type * 123) % 40) + '%',
							40 + ((pixel.type * 123) % 40) + '%'
						//(pixel.id * 123) % 50 + '%'
					],
					color = 'hsl(' + colorArray.join() + ')'

				rect
					.graphics
					.beginFill(color)
					.rect(pixelSize * x, pixelSize * y, pixelSize, pixelSize)

				stage.addChild(rect)
				stage.scaleX = 0.5
				stage.update()
			}


			function drawHTML(x, y, pixel) {

				var colorArray = [
							(pixel.owner * 100) % 360,
							60 + ((pixel.type * 123) % 40) + '%',
							40 + ((pixel.type * 123) % 40) + '%'
						//(pixel.id * 123) % 50 + '%'
					],
					color = 'hsl(' + colorArray.join() + ')',
					$pixelElement = $('<div class="pixel"></div>')

				$pixelElement.css({
					width: 1 / data.field.length * 100  + '%',
					height: 1 / data.field[0].length * 100  + '%',
					left: (x / data.field.length) * 100 + '%',
					top: (y / data.field[0].length) * 100 + '%',
					'background-color': color
				})


				$pixelElement.appendTo($htmlCanvas)
			}

			$htmlCanvas.html('')

			if (firstCall === true) {
				//canvas.setAttribute('width', String(pixelSize * data.field.length) + 'px')
				$htmlCanvas.css({width: String(pixelSize * data.field.length + 1.5) + 'px'})
				//canvas.setAttribute('height', String(pixelSize * data.field[0].length) + 'px')
				$htmlCanvas.css({'height': String(pixelSize * data.field[0].length) + 'px'})
				firstCall = false
			}

			data.players.forEach(function (player) {

				var x = player.position[0],
					y = player.position[1],
					matrix = shared.rotateMatrix(shared.types[player.type], player.rotation),
					dx,
					dy

				for (dy = 0; dy < matrix.length; dy++)
					for (dx = 0; dx < matrix[0].length; dx++)
						if (matrix[dy][dx])
							data.field[dx + x][dy + y] = {
								id: player.id,
								owner: player.pid,
								type: player.type
							}
			})

			data.field.forEach(function (column, x) {
				column.forEach(function (pixel, y) {

					if (pixel)
						drawHTML(x, y, pixel)
					//drawOnCanvas(x, y, pixel)
				})
			})

			document.getElementById('score').innerHTML = data.score
		}


		for (key in keymap)
			if (keymap.hasOwnProperty(key))
				Mousetrap.bind(key, keymap[key])


		/*document.body.addEventListener('touchmove', function(event){
		 event.preventDefault()

		 console.log(event)

		 })*/

		Hammer(document.body, {prevent_default: true})
			.on('swipeup swipedown dragleft dragright tap', function (event) {

				console.log(event.type)

				touchMap[event.type]()
			})


		socket.on('base', function (data) {
			console.log(data)
			render(data)
		})
	}

}(window, document)
