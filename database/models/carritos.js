import { DataTypes } from "sequelize";
import db from "../config/db.js";
import FormularioPreCompras from "./formularioPreCompras.js"; 
import CompraCarritos from "./compraCarritos.js"; 

const carritos = db.define(
  "Carritos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    FormularioPreComprasId: {
      type: DataTypes.INTEGER, // Debe coincidir con el tipo de datos de la clave primaria en FormularioPreCompras
      allowNull: false,
    },
    fechaCompra: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    precioTotal: {
      type: DataTypes.DECIMAL(10, 2), // Precio total de la compra
      allowNull: false,
    },
    // Otras columnas para la información específica del carrito
  },
  {
    tableName: "Carritos",
    timestamps: false,
  }
);

// Define la relación entre Carrito y FormularioPreCompras
carritos.belongsTo(FormularioPreCompras, { foreignKey: "id" });

// Define la relación entre Carrito y CompraCarritos
carritos.hasMany(CompraCarritos, { foreignKey: "carritosId" });


export default carritos;
