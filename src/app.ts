import express from "express";
import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { globalErrorHandler } from "./controllers/errorController";
const app = express();
app.use(express.json());

app.use("/test", (_, res) => {
  res.send("test ping");
});

app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(globalErrorHandler);

export default app;
