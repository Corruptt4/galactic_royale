const socket = io()
const canvas = document.getElementById("canvas")
,           ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

var players = []
,      objects = []

socket.on("playerUpd", (plrs) => {
    players.push(plrs)
})






// renderer
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    requestAnimationFrame(render)
}
render()