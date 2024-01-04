import { DataTypes, Sequelize } from "sequelize";
import db from "../config/db.js";

const ProductosDisponibles = db.define(
  "ProductosDisponibles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stockDisponible: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    },
  {
    tableName: "ProductosDisponibles", 
    timestamps: false, 
  }
);


export default ProductosDisponibles;