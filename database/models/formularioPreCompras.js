import { DataTypes } from "sequelize";
import db from "../config/db";

const FormularioPreCompras = db.define(
    "FormularioPreCompras",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombreCompleto: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        celular: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cp: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        calle: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        numero: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        manzana: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        barrio: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        localidad: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        provincia: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
);

export default FormularioPreCompras;