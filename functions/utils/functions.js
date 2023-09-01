import FormularioPreCompras from '../../database/models/formularioPreCompras.js';


//FUNCIÓN PARA CARGAR LOS DATOS FORMULARIO-PRE-COMPRAS EN SQL:
const handleFormularioPreCompras2 = async (formData) => {
	try {
		console.log("Funcion Insertar datos",formData);
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
		return { message: "Usuario registrado con éxito desde handleFormularioPreCompras !", usuario: nuevoRegistro };
	} catch (error) {
		console.error("Error al registrar el usuario desde handleFormularioPreCompras:", error);
		console.log('este es el formData---->', formData);
		console.log('este es el Error---->', error);
		// Si hay un error, envía una respuesta de error
		return { message: "Error al registrar el usuario desde el handleFormularioPreCompras" };
	}
}

const functions = {
    handleFormularioPreCompras2,
};

export default functions;