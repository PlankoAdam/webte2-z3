const http = require("http").createServer();
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("connected!!!");

  socket.on("message", (msg) => {
    console.log(msg);
    io.emit("message", msg);
  });
});

http.listen(8080, () => {
  console.log("listening 8080");
});
