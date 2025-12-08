import "./socket";
import SocketService from "./services/socket.service22.js";
import logger from "./utils/logger";

// import { createSocketIOServer } from "./services/socket.service.js";
// import socketServer from "./socket/index.js";
// createSocketIOServer(4000)

async function bootsrapServer(){

    try{

        logger.info(`Starting up socket service.`)

        const socketService = new SocketService()

    }catch(error){
        logger.error(`Error in bootstrapping server start up`,error)
    }

}