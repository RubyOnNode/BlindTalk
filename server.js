const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./util/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./util/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set Static Folder
app.use(express.static("public"));

//Run When client connects
io.on("connection", (socket) => {
  let botName = "nEEm";

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //welcome new user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord"));

    //Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    //send users and by info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen fir chat message
  socket.on("chatMessage", (msg) => {
    const currentUser = getCurrentUser(socket.id);

    io.to(currentUser.room).emit(
      "message",
      formatMessage(currentUser.username, msg)
    );
  });

  //Disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server Running On PORT ${PORT}`);
});
