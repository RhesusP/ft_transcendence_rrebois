const canvas = document.getElementById('gameCanvas')
const context = canvas.getContext("2d") // what for ?

const ball = {
    radius: 5,
    positionX: canvas.width / 2,
    positionY: canvas.height / 2,
    velocityX: 1,
    velocityY: 1,
    color: 'white'
}

const leftPaddle = {
    height: 100,
    width: 10,
    positionX: 0,
    PositionY: canvas.height / 2 - leftPaddle.height / 2,
    color: 'blue',
    player: 'left',
    speed: 1
}
const rightPaddle = {
    height: 100,
    width: 10,
    positionX: canvas.width - rightPaddle.width,
    PositionY: canvas.height / 2 - rightPaddle.height / 2,
    color: 'red',
    player: 'right',
    speed: 1
}