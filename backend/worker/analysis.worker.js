import { Worker } from "bullmq";
// @ts-ignore
import { createBullMQConnection } from "../config/bullmqConnection.js";
import { prisma } from "../lib/prisma.js";
import runAnalysis from "../services/analysis.service.js";
/**
 * Runs the analysis for a given analysis run ID and installation ID.
 * @param params - The parameters for the analysis.
 * @param params.analysisRunId - The ID of the analysis run.
 * @param params.installationId - The installation ID.
 * @returns A promise that resolves when the analysis is complete.
 */

const analysisWorker = new Worker(
  "analysis",
  async (job) => {
    console.log("Processing job:", job.data);
    try {
      const updated = await prisma.analysisRun.updateMany({
        where: {
          id: job.data.analysisRunId,
          state: "PENDING",
        },
        data: {
          startedAt: new Date(),
          state: "PROCESSING",
        },
      });

      // Simulate analysis processing
      if (updated.count === 0) {
        console.log("No analysis run found");
        return;
      }
      await runAnalysis({
        analysisRunId: job.data.analysisRunId,
        installationId: job.data.installationId,
      });
      await prisma.analysisRun.update({
        where: {
          id: job.data.analysisRunId,
        },
        data: {
          finishedAt: new Date(),
          state: "SUCCESS",
        },
      });
    } catch (error) {
      console.error("Error processing job:", error);
      // TODO(v2):
      // Allow re-analysis for FAILED/TIMEOUT AnalysisRun
      // with capped retries per commit_sha

      await prisma.analysisRun.update({
        where: {
          id: job.data.analysisRunId,
        },
        data: {
          finishedAt: new Date(),
          state: "FAILED",
          lastError: error?.message || "Analysis failed",
        },
      });

      throw error;
    }
  },
  { connection: createBullMQConnection() },
);

analysisWorker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} has been completed.`);
  console.log(`Result:`, job.returnvalue);
});

analysisWorker.on("failed", (job, err) => {
  console.error(`Job with ID ${job.id} has failed.`, err);
});