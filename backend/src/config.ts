import dotenv from "dotenv"
dotenv.config()

function getEnv(key:string): string {

    const value = process.env[key]

    if( value == ""  || value == undefined || value == null){
        throw new Error(`Cannot start without missing variable ${key}`)
    }

    return value

}

export const config = {
    PORT:getEnv("PORT"),
    OSRM_URL:getEnv("OSRM_URL"),
}