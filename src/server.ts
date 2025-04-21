import { Server } from "http";
import app from "./app";
import { sequelize } from "./config/database";

let server: Server;

sequelize.sync().then(() => {
  console.log("Database synced");
  server = app.listen(3000, () => {
    console.log("server running on port 3000");
  });
});

const shutdown = async () => {
  console.log("Shutting down gracefully ...");

  server.close(async () => {
    console.log("HTTP server closed");
    try {
      await sequelize.close();
      console.log("Database connection closed");
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
