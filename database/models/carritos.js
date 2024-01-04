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
      type: DataTypes.DECIMAL(10, 3), 
      allowNull: false,
    },
    external_reference: {
      type: DataTypes.STRING(500),
      allowNull: true,
      unique: true,
    },
    estadoCompra: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    zohoNumeroTicket: {
      type: DataTypes.STRING(500),
      allowNull: true,
      unique: true,
    }, 
    mercadoPagoOrderId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
    },
    mercadoPagoPaymentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
    },
    ticket_created: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false, // Por defecto, no se ha creado el ticket
  },
  email_sent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false, // Por defecto, el correo no ha sido enviado
  },
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
