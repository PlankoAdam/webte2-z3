const http = require("http").createServer();
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let players = [];
let nextId = 0;

const timerStartVal = 60;
let timeRemainingSec = timerStartVal;
let intervalID = null;

io.on("connection", (socket) => {
  // console.log("connected!!!");
  socket.emit("connected", nextId++);

  socket.on("player_joined", (player) => {
    player.socketId = socket.id;
    players.push(player);
    io.emit("player_joined", players);
    // console.log(players.length);
    if (players.length >= 2 && !intervalID) {
      startTimer();
    }
  });

  socket.on("update", (player) => {
    let updatedPlayer = players.find((pl) => pl.id == player.id);
    updatedPlayer.coords = player.coords;
    updatedPlayer.trail = player.trail;
    updatedPlayer.area = player.area;
    updatedPlayer.coverage = player.coverage;

    socket.broadcast.emit("update", updatedPlayer);
  });

  socket.on("overtake", (overtakenPlayer) => {
    let updatedOvertakenPlayer = players.find(
      (pl) => pl.id == overtakenPlayer.id
    );
    if (updatedOvertakenPlayer) {
      updatedOvertakenPlayer.coords = overtakenPlayer.coords;
      updatedOvertakenPlayer.trail = overtakenPlayer.trail;
      updatedOvertakenPlayer.area = overtakenPlayer.area;
    }

    io.emit("overtake", updatedOvertakenPlayer);
  });

  socket.on("lose", (playerId) => {
    players = players.filter((pl) => pl.id != playerId);
    socket.broadcast.emit("disconnected", playerId);
    if (players.length == 1) {
      let winner = players[0];
      io.emit("win", winner);
      stopTimer();
    }
  });

  socket.on("disconnect", () => {
    const disconnectedPlayer = players.find((pl) => pl.socketId == socket.id);
    players = players.filter((pl) => pl.socketId != socket.id);
    if (disconnectedPlayer) {
      io.emit("disconnected", disconnectedPlayer.id);
    }
    if (players.length < 2) {
      stopTimer();
    }
  });
});

http.listen(3003, () => {
  console.log("listening 3003");
});

function startTimer() {
  intervalID = setInterval(() => {
    io.emit("timer", timeRemainingSec--);
    if (timeRemainingSec <= 0) {
      io.emit("win", chooseWinner());
      stopTimer();
    }
    if (players.length < 2) stopTimer();
  }, 1000);
}

function stopTimer() {
  if (intervalID) clearInterval(intervalID);
  intervalID = null;
  timeRemainingSec = timerStartVal;
}

function chooseWinner() {
  let winner = players[0];
  players.forEach((pl) => {
    if (pl.coverage > winner.coverage) {
      winner = pl;
    }
  });
  return winner;
}
