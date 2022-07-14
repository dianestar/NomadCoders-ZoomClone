import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

const getPublicRooms = () => {
  const publicRooms = [];

  const {
    sockets: {
      adapter: { sids, rooms }
    }
  } = wsServer;
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
};

const getPeopleCount = (roomname) => {
  return wsServer.sockets.adapter.rooms.get(roomname)?.size;
};

wsServer.on("connection", (socket) => {
  socket.onAny((e) => {
    console.log(e);
  });

  socket.on("set_nickname", (nickname, done) => {
    socket["nickname"] = nickname;
    wsServer.sockets.emit("get_rooms", getPublicRooms());
    done();
  });

  socket.on("enter_room", (roomname, done) => {
    socket.join(roomname);
    done(getPeopleCount(roomname));
    socket.to(roomname).emit("entered", socket.nickname);
    wsServer.sockets.emit("get_rooms", getPublicRooms());
    socket.to(roomname).emit("get_count", getPeopleCount(roomname));
  });

  socket.on("new_chat", (roomname, chat, done) => {
    socket.to(roomname).emit("new_chat", `${socket.nickname}: ${chat}`);
    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("left", socket.nickname);
      socket.to(room).emit("get_count", getPeopleCount(room) - 1);
    });
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("get_rooms", getPublicRooms());
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(process.env.PORT, handleListen);
