import ChatServer from "./src/service/ChatServer";

const chatServer = new ChatServer(5000);

// chatServer.connectDB();
chatServer.listen();
