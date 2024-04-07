const http = require("http").createServer();
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

let players = [];
let nextId = 0;

io.on("connection", (socket) => {
  // console.log("connected!!!");
  socket.emit("connected", nextId++);

  socket.on("player_joined", (player) => {
    player.socketId = socket.id;
    players.push(player);
    io.emit("player_joined", players);
    console.log(players.length);
  });

  socket.on("update", (player) => {
    let updatedPlayer = players.find((pl) => pl.id == player.id);
    updatedPlayer.coords = player.coords;
    updatedPlayer.trail = player.trail;
    updatedPlayer.area = player.area;

    socket.broadcast.emit("update", updatedPlayer);
  });

  socket.on("disconnect", () => {
    const disconnectedPlayerId = players.find(
      (pl) => pl.socketId == socket.id
    ).id;
    players = players.filter((pl) => pl.socketId != socket.id);
    io.emit("disconnected", disconnectedPlayerId);
    console.log(players.length);
  });
});

http.listen(8080, () => {
  console.log("listening 8080");
});
