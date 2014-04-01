!function (window, document) {

	var counter = 0,
		scoreContainer = document.getElementById('score')

	function render(data, containerElement) {

		var styleElement;
		var pixelSize = 14,
			maxWidth = 600,
			width,
			height,
			newPixelSize,
			x,
			y
		//stage = new createjs.Stage(canvas)


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
				color = 'hsl(' + colorArray.join(',') + ')',
			//$pixelElement = $('<div class="pixel"></div>'),
				pixelElement = document.createElement('div'),
				style = {
					width: 1 / data.field.length * 100 + '%',
					height: 1 / data.field[0].length * 100 + '%',
					left: (x / data.field.length) * 100 + '%',
					top: (y / data.field[0].length) * 100 + '%',
					'background-color': color
				},
				styleString = JSON
					.stringify(style, function (key, value) {
						return (typeof value === 'string') ?
							value.replace(/,/g, '$') :
							value
					})
					.replace(/,/g, ';')
					.replace(/\$/g, ',')
					.replace(/"/g, '')
					.replace(/^\{(.*)\}$/g, '$1')

			pixelElement.className = 'pixel'
			pixelElement.setAttribute('style', styleString)

			containerElement.appendChild(pixelElement)
		}

		function drawHtmlInc(x, y, pixel) {

			// Performance is worse than string-concatenation
			/*
			 var style = {
			 width: (1 / data.field.length * 100).toFixed(1) + '%',
			 height: (1 / data.field[0].length * 100).toFixed(1) + '%',
			 left: ((x / data.field.length) * 100).toFixed(1) + '%',
			 top: ((y / data.field[0].length) * 100).toFixed(1) + '%'
			 },
			 styleString = JSON
			 .stringify(style, function (key, value) {
			 return (typeof value === 'string') ?
			 value.replace(/,/g, '$') :
			 value
			 })
			 .replace(/,/g, ';')
			 .replace(/\$/g, ',')
			 .replace(/"/g, '')
			 .replace(/^\{(.*)\}$/g, '$1')
			 */

			var pixelElement = document.createElement('div'),
				styleString =
					'left:' + ((x / data.field.length) * 100).toFixed(1) + '%;' +
					'top:' + ((y / data.field[0].length) * 100).toFixed(1) + '%;'


			pixelElement.className = 'pixel block-' + pixel.owner + '-' + pixel.type
			pixelElement.setAttribute('style', styleString)

			containerElement.appendChild(pixelElement)
		}


		containerElement.innerHTML = ''

		newPixelSize = Math.round(maxWidth / data.field.length)

		if (newPixelSize < pixelSize) {
			pixelSize = newPixelSize
			width = newPixelSize * data.field.length
			height = newPixelSize * data.field[0].length
		}
		else {
			width = pixelSize * data.field.length
			height = pixelSize * data.field[0].length
		}

		containerElement.setAttribute('style',
				'width:' + width + 'px;' +
				'height:' + height + 'px'
		)

		styleElement = document.createElement('style')

		styleElement.textContent =
			'.pixel {' +
			'width:' + (1 / data.field.length * 100).toFixed(1) + '%;' +
			'height:' + (1 / data.field[0].length * 100).toFixed(1) + '%;' +
			//'width:' + pixelSize + 'px;' +
			//'height:' + pixelSize + 'px;' +
			'}'

		containerElement.appendChild(styleElement)


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

		// Better performance than forEach
		for (x = 0; x < data.field.length; x++)
			for (y = 0; y < data.field[0].length; y++)

				if (data.field[x][y]) {
					drawHtmlInc(x, y, data.field[x][y])
				}


		/*data.field.forEach(function (column, x) {
		 column.forEach(function (pixel, y) {

		 if (pixel){

		 drawHTML(x, y, pixel)
		 //drawOnCanvas(x, y, pixel)
		 }
		 })
		 })*/

		scoreContainer.innerHTML = data.score

		console.timeEnd('render')
	}


	window.polyblocks = function (socket, canvas) {

		var modifications = {
				rotateRight: function () {
					console.time('socket')
					socket.emit('update', 'up')
				},
				rotateLeft: function () {
					console.time('socket')
					socket.emit('update', 'down')
				},
				moveRight: function () {
					console.time('socket')
					socket.emit('update', 'right')
				},
				moveLeft: function () {
					console.time('socket')
					socket.emit('update', 'left')
				},
				moveDown: function () {
					console.time('socket')
					socket.emit('update', 'space')
				}
			},
			keymap = {
				up: function (event) {
					event.preventDefault()
					modifications.rotateRight()
				},
				right: function (event) {
					event.preventDefault()
					modifications.moveRight()
				},
				down: function (event) {
					event.preventDefault()
					modifications.rotateLeft()
				},
				left: function (event) {
					event.preventDefault()
					modifications.moveLeft()
				},
				space: function (event) {
					event.preventDefault()
					modifications.moveDown()
				}
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
			latestX = null,
			key,
			hammerConfig = {
				prevent_default: true,
				swipe_velocity: 0.1
			}


		for (key in keymap)
			if (keymap.hasOwnProperty(key))
				Mousetrap.bind(key, keymap[key])


		Hammer(document.body, hammerConfig)
			.on('dragstart', function (event) {
				latestX = event.gesture.startEvent.center.pageX
			})
			.on('dragstart dragleft dragright swipedown swipeup tap', function (event) {

				//console.log(event.type)

				if (event.type === 'dragright' || event.type === 'dragleft') {
					if (Math.abs(latestX - event.gesture.center.pageX) >= 15) {
						touchMap[event.type]()
						latestX = event.gesture.center.pageX
					}
				}
				else {
					console.log(event.type)
					touchMap[event.type]()
				}

			})


		socket.on('base', function (data) {
			//console.timeEnd('socket')
			console.time('render')
			render(data, canvas)
		})
	}

}(window, document)
