import * as http from "http";
import * as io from "socket.io";
import * as mongoose from "mongoose";
import { ip } from "../../config/server";
import {
  RecieveFileDTO,
  RecieveMessageDTO,
  SendMessageDTO,
} from "../dto/ChatServer";
import { ProcessDTO } from "../dto/FileHandling";
const fs = require("fs");
// import * as fs from "fs";

interface Client {
  socket: io.Socket;
  username: string;
}

interface Files {
  [key: string]: any;
}

export default class ChatServer {
  public server: http.Server;
  public port: number;
  public ip: string;
  public clients: Array<Client>;
  private ioServer: io.Server;
  private files: Files = {};
  private struct: ProcessDTO;
  // private db: Db;

  constructor(port: number) {
    this.server = http.createServer();
    this.ioServer = io(this.server);
    this.port = parseInt(process.env.PORT, 10) || port;
    this.ip = ip;
    this.clients = [];
    this.struct = {
      name: null,
      type: null,
      size: 0,
      data: "",
      slice: 0,
      recipients: [],
    };

    this.files = {
      name: null,
      type: null,
      size: 0,
      data: [],
      slice: 0,
    };
  }

  public listen() {
    this.server.listen(this.port, this.ip, () => {
      console.log("Server is up and running on", this.server.address());
    });
    this.start();
  }

  // public connectDB() {
  //   // MongoClient.connect("mongodb://localhost:27017/chat", (err, db) => {
  //   //   if (err) {
  //   //     throw err;
  //   //   }
  //   //   console.log("MongoDB connected...");
  //   //   this.db = db.db();
  //   // });

  //   mongoose.connect(
  //     "mongodb://localhost:27017/chat",
  //     {
  //       useCreateIndex: true,
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //     },
  //     (err) => {
  //       if (err) {
  //         console.log("Failed to connect to database", err);
  //       } else {
  //         console.log("Connected to database");
  //       }
  //     }
  //   );
  //   // setGlobalOptions({
  //   //   globalOptions: {
  //   //     useNewEnum: true,
  //   //   },
  //   // });
  // }

  public start() {
    this.ioServer.on("connection", (socket) => {
      console.log(
        "New connection established!\nAddress: ",
        socket.handshake.address,
        socket.handshake.url,
        socket.id,
        socket.nsp.name
      );
      console.log(
        "........................................................................"
      );

      const id: string = socket.handshake.query.id;
      socket.join(id);
      this.clients.push({ socket, username: id });

      socket.on("send-message", (message: SendMessageDTO) => {
        const { recipients, text } = message;
        recipients.forEach((recipient) => {
          const newRecipients = recipients.filter((r) => r !== recipient);
          newRecipients.push(id);
          const recievedData: RecieveMessageDTO = {
            recipients: newRecipients,
            sender: id,
            text,
          };
          socket.broadcast.to(recipient).emit("receive-message", recievedData);
        });
      });

      socket.on("slice upload", (data: ProcessDTO) => {
        console.log("started");

        if (!this.files[data.name]) {
          console.log("hah");

          this.files[data.name] = Object.assign({}, this.struct, data);
          this.files[data.name].data = [];
          console.log(this.files[data.name]);
        }

        data.data = new Buffer(new Uint8Array(data.data as ArrayBuffer));

        this.files[data.name].data.push(data.data);
        this.files[data.name].slice++;
        console.log(
          " naaaaaaaaaaaaaaaaaa ",
          this.files[data.name].slice,
          " ",
          data.data
        );

        data.recipients.forEach((recipient) => {
          const reciever = this.clients.filter(
            (v) => v.username === recipient
          )[0];
          const newRecipients = data.recipients.filter((r) => r !== recipient);
          newRecipients.push(id);
          const recievedData: RecieveFileDTO = {
            recipients: newRecipients,
            sender: id,
            data: data.data,
          };

          reciever.socket.broadcast
            .to(recipient)
            .emit("recieve chunks", recievedData);
          console.log(reciever.username, " ", reciever.socket.id);
        });

        if (
          this.files[data.name].slice * 100000 >=
          this.files[data.name].size
        ) {
          //do something with the data
          console.log("finished!");
          const fileBuffer = Buffer.concat(this.files[data.name].data);
          console.log(data.name);

          fs.writeFile("tmp/" + data.name, fileBuffer, (err: any) => {
            delete this.files[data.name];
            console.log("ey baba what ?");

            if (err) {
              console.log(err);
              return socket.emit("upload error");
            }
            socket.emit("end upload");

            socket.emit("upload finished", {
              name: data.name,
              length: data.size,
            });

            console.log("now");
          });
        } else {
          console.log(
            "nowww ",
            this.files[data.name].size,
            " ",
            this.files[data.name].slice,
            " ",
            data.name
          );

          socket.emit("request slice upload", {
            currentSlice: this.files[data.name].slice,
          });
        }
      });
    });
  }
}
