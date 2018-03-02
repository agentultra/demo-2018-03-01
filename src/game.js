const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 780
, stageH = 400
, buttons = {
    Jump: 0
}
, gravity = 0.8
, PLAYER_STANDING = 0
, PLAYER_JUMPING = 1
, PLAYER_FALLING = 2
, PLAYER_DEAD = 3
, OBSTACLE_BOULDER = 10

canvas.width = stageW
canvas.height = stageH

let tick = 0
, running = true

const clamp = (min, max, v) =>
      v < min ? min : v > max ? max : v

const state = {}

const Player = (x, y) => ({
    x, y,
    dx: 0, dy: 0.1,
    speed: 4,
    state: PLAYER_STANDING
})

const Obsctacle = (x, y, type, speed=5) => ({
    x, y, type, speed, dead: false
})

const initPlayer = (x, y) =>
      Object.assign(
          state,
          {
              player: Player(x, y)
          }
      )

const initObstacles = () =>
      Object.assign(
          state,
          {
              obstacles: []
          }
      )

const initScore = () =>
      Object.assign(
          state,
          {
              score: 0
          }
      )

const init = () => {
    initPlayer(40, stageH - 70)
    initObstacles()
    initScore()
}

const btn = name => buttons.hasOwnProperty(name) && buttons[name]

const doPlayerJump = player => {
    if (player.state === PLAYER_STANDING)
        Object.assign(state.player, {
            dy: -player.speed * 8,
            state: PLAYER_JUMPING
        })
}

const updatePlayer = player => {
    player.dy += player.speed * gravity
    if (player.state !== PLAYER_DEAD) {
        if (player.state === PLAYER_JUMPING && player.dy > 0)
            player.state = PLAYER_FALLING
        player.y = clamp(0, stageH - 70, player.y + player.dy)
        player.x = player.x + player.dx
        if (player.y + 20 >= stageH - 70)
            player.state = PLAYER_STANDING
        return;
    }
}

const maybeNewObstacle = () => {
    const {obstacles} = state
    if (tick % 80 === 0) {
        if (Math.random() > 0.3)
            obstacles.push(Obsctacle(stageW, stageH - 70, OBSTACLE_BOULDER))
    }
}

const incScore = amt => {
    state.score += amt
}

const updateObstacle = obstacle => {
    obstacle.x -= obstacle.speed
    if (obstacle.x < -20) {
        obstacle.dead = true
        incScore(5)
    }
}

const clearRemovedObstacles = () => {
    const {obstacles} = state
    Object.assign(
        state,
        {
            obstacles: obstacles.filter(x => !x.dead)
        }
    )
}

const collision = (box1, box2) =>
      (box1.x < box2.x + 20 &&
       box1.x + 20 > box2.x &&
       box1.y < box2.y + 20 &&
       box1.y + 20 > box2.y)

const update = dt => {
    const {obstacles, player} = state
    if (btn('Jump'))
        doPlayerJump(player)
    updatePlayer(player)
    maybeNewObstacle()
    for (let obs of obstacles) {
        updateObstacle(obs)
        if (collision(player, obs)) {
            player.state = PLAYER_DEAD
            running = false
        }
    }
    clearRemovedObstacles()
}

const clr = () => {
    stage.fillStyle = 'skyblue'
    stage.fillRect(0, 0, stageW, 350)
    stage.fillStyle = 'darkgrey'
    stage.fillRect(0, 350, stageW, stageH)
}

const renderPlayer = () => {
    const {player} = state
    stage.fillStyle = 'yellow'
    stage.fillRect(player.x, player.y, 20, 20)
}

const renderObstacles = () => {
    const {obstacles} = state
    for (let obs of obstacles) {
        switch (obs.type) {
        case OBSTACLE_BOULDER:
            stage.fillStyle = 'red'
            stage.fillRect(obs.x, obs.y, 20, 20)
        }
    }
}

const renderScore = () => {
    const {score} = state
    stage.font = '14px arial'
    stage.fillStyle = 'white'
    stage.fillText(`Score: ${score}`, 20, 20)
}

const renderGameOver = () => {
    stage.font = '48px serif'
    stage.fillStyle = 'white'
    stage.fillText('GAME OVER', stageW / 2, stageH / 2)
}

const render = () => {
    clr()
    renderPlayer()
    renderObstacles()
    renderScore()
    if (!running) {
        renderGameOver()
    }
}

const loop = dt => {
    if (running) update(dt)
    render()
    tick += 1
    window.requestAnimationFrame(loop)
}

init()
window.requestAnimationFrame(loop)

document.addEventListener('keydown', ev => {
    if (ev.key === ' ') {
        buttons.Jump = 1
    }
})

document.addEventListener('keyup', ev => {
    if (ev.key === ' ')
        buttons.Jump = 0
})
