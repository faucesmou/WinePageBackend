import Usuario from "./Usuario.js";

// relacion 1:1 de derecha a izquierda
// Precio.hasOne(Propiedad);

// relacion 1:1 de izquierda a derecha
/* Propiedad.belongsTo(Usuario, { foreignKey: "usuarioId" });

Mensaje.belongsTo(Usuario, { foreignKey: "usuarioId" }); */

export { Usuario };