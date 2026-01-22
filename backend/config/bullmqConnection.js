// config/bullmqConnection.js
import IORedis from "ioredis";

export function createBullMQConnection() {
  return new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    maxRetriesPerRequest: null,
  });
}
