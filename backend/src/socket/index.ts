import SocketServer from "./create.server.js"
import { config } from "../config.js";

const socketServer = new SocketServer(Number(config.PORT))

export default socketServer;