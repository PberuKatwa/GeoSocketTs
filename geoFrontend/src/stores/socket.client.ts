import { ref } from "vue";

import { defineStore } from "pinia";
import SocketService from "@/services/socket.service";

const socketService = new SocketService("http://localhost:4000")

export const useSocketClientStore = defineStore( "socketClient", function(){

    const isConnected = ref(false);

})