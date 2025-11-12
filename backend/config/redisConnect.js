import redisClient from "./redisClient.js";

async function redisConnect() {
     redisClient.on('error', err => console.log('Redis Client Error', err));
    console.log('Redis client connected');
    await redisClient.connect();
}

export default redisConnect ; 