import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./userModel";

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  status: "Open" | "In Progress" | "Completed" | "Blocked";
  priority: "High" | "Medium" | "Low";
  dueDate?: Date;
  assignedTo?: number;
  createdBy: number;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, "id"> {}

interface TaskInstance
  extends Model<TaskAttributes, TaskCreationAttributes>,
    TaskAttributes {}

export const Task = sequelize.define<TaskInstance>(
  "Task",
  {
    id: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Completed", "Blocked"),
      allowNull: false,
      defaultValue: "Open",
    },
    priority: {
      type: DataTypes.ENUM("High", "Medium", "Low"),
      allowNull: false,
      defaultValue: "Low",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    underscored: true,
    version: true,
  }
);

Task.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });
Task.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Task, { foreignKey: "assignedTo", as: "assignedTasks" });
User.hasMany(Task, { as: "createdTasks", foreignKey: "createdBy" });
