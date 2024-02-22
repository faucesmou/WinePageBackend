import { DataTypes, Sequelize } from "sequelize";
import db from "../config/db.js";
/* import bcrypt from "bcrypt"; */

const Usuario = db.define(
  "usuariosAMW",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    correo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     asunto: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mensaje: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "usuariosAMW", // Esto asegura que el nombre de la tabla sea "usuariosAMW".
    timestamps: false, // Si no necesitas campos createdAt y updatedAt, puedes deshabilitarlos.
  }
);

export default Usuario;