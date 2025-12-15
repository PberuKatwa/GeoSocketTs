import SocketServer from "./create.server.js"
import { config } from "../config.js";

const port = Number(config.PORT)
const socketServer = new SocketServer(port)

export default socketServer;