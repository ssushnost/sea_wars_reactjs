const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const rooms = {};

function logRooms() {
  console.log(rooms);
  for (const roomID in rooms) {
    console.log(rooms[roomID].players);
  }
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`new user connected: ${socket.id}`);

  socket.on("join_room", (roomID) => {
    if (rooms[roomID]) {
      if (rooms[roomID].players.length < 2) {
        rooms[roomID].players.push({ id: socket.id, ready: false });
      } else {
        io.to(socket.id).emit("failed_join", true);
        return;
      }
    } else {
      rooms[roomID] = { players: [{ id: socket.id, ready: false }] };
    }
    socket.join(roomID);
    io.to(socket.id).emit("success_join", true);
  });

  socket.on("hit", (data) => {
    console.log("hit");
    socket.to(data.roomID).emit("hit_back", data);
    console.log(data);
  });

  socket.on("change_turn", (isTurn) => {
    let _roomID = "";
    for (const roomID in rooms) {
      rooms[roomID].players.forEach((player) => {
        if (player.id === socket.id) {
          _roomID = roomID;
        }
      });
    }
    socket.to(_roomID).emit("change_turn_back", isTurn);
  });

  socket.on("hit_result", (data) => {
    console.log("hit result");
    let _roomID = "";
    for (const roomID in rooms) {
      rooms[roomID].players.forEach((player) => {
        if (player.id === socket.id) {
          _roomID = roomID;
        }
      });
    }
    socket.to(_roomID).emit("hit_result_back", data);
  });

  socket.on("field_ready", (isReady) => {
    let _roomID = "";
    for (const roomID in rooms) {
      rooms[roomID].players.forEach((player, playerIndex) => {
        if (player.id === socket.id) {
          _roomID = roomID;
          rooms[roomID].players[playerIndex].ready = true;
          return;
        }
      });
    }
    io.to(rooms[_roomID].players[0].id).emit("set_turn", true);
  });

  socket.on("disconnect", () => {
    for (const roomID in rooms) {
      rooms[roomID].players.forEach((player, player_index) => {
        if (player.id === socket.id) {
          socket.leave(roomID);
          rooms[roomID].players.splice(player_index, 1);
          return;
        }
      });
    }
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
