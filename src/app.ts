import express from "express";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import { NotFoundError } from "./errors.js";

export const app = express();

app.use(express.json());      // parse JSON bodies
app.use(requestId);           // assign an ID
app.use(requestLogger);       // log the request

app.use(healthRouter);        // ← routes go here
app.use((req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.path}`));
});
app.use(errorHandler);        // ← ALWAYS LAST