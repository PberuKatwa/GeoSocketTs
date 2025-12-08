import { Server, Socket } from "socket.io";
import { createServer, Server as HttpServer } from "http";
import logger from "../utils/logger";

class SocketServer{
    private readonly port:number;
    private readonly io:Server;
    private readonly httpServer:HttpServer;

    constructor( port:number ){
        this.port = port;

        const servers = this.intializeServers();
        this.io = servers.io
        this.httpServer = servers.httpServer;

    }

    private intializeServers(){
        try{

            const httpServer = createServer()

            const io = new Server( httpServer, { cors:{
                origin:'*'
            }})

            return { httpServer, io }
        }catch(error){
            throw error;
        }
    }

    /**
     * Start Socket.IO server and attach dynamic event handler
     * @param eventName Name of the socket event
     * @param callbackFn Function to handle the event (receives payload + socket)
    */
    public startIoSever( eventName:string, callBackFn:( data:any, socket:Socket ) => Promise<void> ){
        try{

            const httpServer = createServer()

            const io = new Server( httpServer, { cors:{
                origin:'*'
            }})

            io.on("connection", function (socket){

                logger.info(`Client successfully connected on socket id:${socket.id}`)

                socket.on( eventName, async function (payload:any){
                    try{
            
                        await callBackFn( payload, socket )                       

                    }catch(error:any){
                        
                        logger.error(`SocketIo error in handling event:${eventName}`,{
                            errorMessage:error.message,
                            errorStack:error.stack
                        })

                        socket.emit("error", { message: "Server error" });
                    }
                })


            })

        }catch(error){
            throw error;
        }
    }

    public handleDisconnect(){
        try{



        }catch(error){
            throw error;
        }
    }

}

export default SocketServer;