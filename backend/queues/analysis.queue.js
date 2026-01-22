import { Queue } from "bullmq";
// @ts-ignore
import { createBullMQConnection } from '../config/bullmqConnection.js';

export const analysisQueue = new Queue("analysis", {
  connection: createBullMQConnection(),
});