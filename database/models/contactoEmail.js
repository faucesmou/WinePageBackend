import { DataTypes } from "sequelize";
import db from "../config/db.js";

const ContactoEmail = db.define(
    "ContactoEmail",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        
    },
    {
        tableName: "ContactoEmail", // Esto asegura que el nombre de la tabla sea "usuariosAMW".
        timestamps: false, // Si no necesitas campos createdAt y updatedAt, puedes deshabilitarlos.
      }
);

export default ContactoEmail;