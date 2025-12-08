import socketServer from "./socket/index.js";
import SocketService from "./services/socket.service22.js";
import logger from "./utils/logger.js";

// import { createSocketIOServer } from "./services/socket.service.js";
// import socketServer from "./socket/index.js";
// createSocketIOServer(4000)

async function bootsrapServer():Promise<void>{

    try{

        logger.info(`Starting up socket server.`)

        const socketService = new SocketService()

        await socketService.calculateRoute();
        await socketService.startTracking();

        logger.info(`Successfully started server`)

    }catch(error){
        logger.error(`Error in bootstrapping server start up`,error)
    }

}

bootsrapServer()