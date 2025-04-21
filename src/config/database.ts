import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "task_management",
  "dbuser",
  "dbpassword",
  {
    host: "localhost",
    dialect: "mysql",
  }
);
