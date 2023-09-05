import FormularioPreCompras from '../../database/models/formularioPreCompras.js';
import CompraCarritos from '../../database/models/compraCarritos.js';
import carritos from '../../database/models/carritos.js';


//FUNCIÓN PARA CARGAR LOS DATOS FORMULARIO-PRE-COMPRAS EN SQL:
const handleFormularioPreCompras2 = async (formData) => {
	try {
		console.log("Funcion Insertar datos", formData);
		// Creamos un nuevo registro de Formulario Pre Compra utilizando el modelo y los datos del formData:
		const nuevoRegistro = await FormularioPreCompras.create({
			nombreCompleto: formData.nombreApellido,
			email: formData.email,
			celular: formData.celular,
			cp: formData.cp,
			calle: formData.calle,
			numero: formData.numero,
			manzana: formData.manzana,
			barrio: formData.barrio,
			localidad: formData.localidad,
			provincia: formData.provincia,
		});
		// Si el usuario se crea correctamente, puedes enviar una respuesta de éxito
		return { 
			id: nuevoRegistro.id,
			createdAt: nuevoRegistro.createdAt,
			message: "Usuario registrado con éxito desde handleFormularioPreCompras !", usuario: nuevoRegistro };
	} catch (error) {
		console.error("Error al registrar el usuario desde handleFormularioPreCompras:", error);
		console.log('este es el formData---->', formData);
		console.log('este es el Error---->', error);
		// Si hay un error, envía una respuesta de error
		return { message: "Error al registrar el usuario desde el handleFormularioPreCompras" };
	}
}

const llenarCarritos = async (FormularioPreComprasId, fechaCompra, precioTotal) => {
	try {
	  console.log("Función para llenar la tabla Carritos");
  
	  // Crea un registro en la tabla Carritos
	  const nuevoCarrito = await carritos.create({
		FormularioPreComprasId: FormularioPreComprasId,
		fechaCompra: fechaCompra,
		precioTotal: precioTotal,
		// Otras columnas específicas del carrito si las tienes
	  });
  
	  // Si todo se crea correctamente, puedes enviar una respuesta de éxito
	  console.log("Carrito insertado con éxito!---nuevoCarrito: ", nuevoCarrito);
	  return { 
		id: nuevoCarrito.id,
		message: "data guardada en Carrito con éxito!" };
	} catch (error) {
	  console.error("Error al insertar data en Carrito:", error);
	  // Si hay un error, envía una respuesta de error
	  return { message: "Error al insertar data en tabla Carrito---> ", error: error  };
	}
  };



	const compraCarritos2 = async (formDataCarrito, carritoId) => {
	try {
		console.log("Funcion Insertar datos compraCarritos", formDataCarrito);

		// Recorre los elementos del formDataCarrito y crea un registro para cada uno
		for (const item of formDataCarrito) {
			const nuevoRegistro = await CompraCarritos.create({
				image: item.image,
				text: item.text,
				price: item.price,
				quantity: item.quantity,
				carritosId: carritoId,
			});
			// Si el registro se crea correctamente, puedes enviar una respuesta de éxito
			console.log("Registro insertado con éxito:", nuevoRegistro);
		}
		return { message: "Registros insertados con éxito desde compraCarritos!" };
	} catch (error) {
		console.error("Error al insertar registros desde compraCarritos:", error);
		// Si hay un error, envía una respuesta de error
		return { message: "Error al insertar registros desde compraCarritos" };
	}
};



  




const functions = {
	handleFormularioPreCompras2,
	llenarCarritos,
	compraCarritos2,
};

export default functions;