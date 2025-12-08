import socketServer from "./socket/index.js";
import SocketService from "./services/socket.service.js";
import logger from "./utils/logger.js";

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