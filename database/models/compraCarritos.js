import { DataTypes, Sequelize } from "sequelize";
import db from "../config/db.js";

const CompraCarritos = db.define(
  "CompraCarritos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    quantity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    },
  {
    tableName: "CompraCarritos", 
    timestamps: false, 
  }
);


export default CompraCarritos;