import FormularioPreCompras from '../../database/models/formularioPreCompras.js';
import CompraCarritos from '../../database/models/compraCarritos.js';
import carritos from '../../database/models/carritos.js';
import axios from 'axios';

//FUNCIÓN PARA CARGAR LOS DATOS FORMULARIO-PRE-COMPRAS EN SQL:
const handleFormularioPreCompras2 = async (formData) => {
	try {
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
			message: "Usuario registrado con éxito desde handleFormularioPreCompras !", usuario: nuevoRegistro
		};
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
			message: "data guardada en Carrito con éxito!"
		};
	} catch (error) {
		console.error("Error al insertar data en Carrito:", error);
		// Si hay un error, envía una respuesta de error
		return { message: "Error al insertar data en tabla Carrito---> ", error: error };
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

const cambioCodigoPorToken = async (authorizationCode) => {
	const clientId = '1000.NEZX419PEDPRC6XR3Q2RG73JH8HNGP';
	const clientSecret = '33a6703d4b254cd39a9ee9706bea8facb35a821823';
	const redirectUri = 'https://www.antoniomaswines.createch.com.ar/';

	try {
		const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
			params: {
				code: authorizationCode,
				grant_type: 'authorization_code',
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				access_type: 'offline',// incluir esto para obtener un token de actualización
			},
		});
		console.log('este es el RESPONSE.DATA--->', response.data);
		const accessToken = response.data.access_token;
		const refreshToken = response.data.refresh_token; // Guarda el token de actualización
		console.log(' ESTE ES EL ACCES TOKEN recibido de la funcion cambioCodigoPorToken', accessToken)
		// Ahora tienes el accessToken que puedes usar en tus llamadas a la API de Zoho Desk.
		return {
		accessToken: accessToken,
		refreshToken: refreshToken,
		};
	} catch (error) {
		console.error('Error al intercambiar el código de autorización por un token:', error);
		throw error;
	}
};

const renovarTokenDeAcceso = async () => {
	const clientId = '1000.NEZX419PEDPRC6XR3Q2RG73JH8HNGP';
	const clientSecret = '33a6703d4b254cd39a9ee9706bea8facb35a821823';
	try {
		const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
			params: {
				refresh_token: '1000.09acd8305932d58a7ee8357ac59f64f7.f9049387e77c85e04003af75d5f71ab4',
				client_id: clientId,
				client_secret: clientSecret,
				scope: 'Desk.tickets.ALL,Desk.tickets.UPDATE,Desk.tickets.CREATE,Desk.contacts.WRITE,Desk.contacts.UPDATE,Desk.contacts.CREATE,Desk.tasks.ALL', // Ajusta el ámbito según tus necesidades
				grant_type: 'refresh_token',
			},
		});

		const nuevoAccessToken = response.data.access_token;
		return nuevoAccessToken;
	  } catch (error) {
		console.error('Error en la función: renovarTokenDeAcceso ---->:', error);
		throw error;
	  }
	  // En tu controlador o en otro lugar, verifica la vigencia del token de acceso antes de realizar llamadas a la API de Zoho Desk.
// Si el token ha expirado, utiliza la función renovarTokenDeAcceso para obtener un nuevo token de acceso y luego realiza la llamada a la API.
	};

const getBodyContactoData = (formData, notasPedidos) => {
	return {
	  zip: formData.cp,
	  lastName: formData.nombreApellido,
	  country: "ARGENTINA",
	  city: formData.localidad,
	  mobile: formData.celular,
	  description: notasPedidos,
	  street: formData.calle,
	  state: formData.provincia,
	  email: formData.email,
	};
  };
  
	const crearContactoApiZoho = async (nuevoAccessToken, formData, notasPedidos,) => {
		const apiUrlContacto = 'https://desk.zoho.com/api/v1/contacts';
		const headers = {
			'orgId': '826795874', // Si necesitas especificar el ID de la organización
			'Authorization': `Zoho-oauthtoken ${nuevoAccessToken}`,
			'Content-Type' : 'application/json',
		};
		const bodyContactoData = {
			"zip": formData.cp,
			"lastName": formData.nombreApellido,
			"country": "ARGENTINA",
			"city": formData.localidad,
			"mobile": formData.celular,
			"description": notasPedidos,
			/* "type": "paidUser", */
			/* "title": "The contact", */
			/* "firstName": "Rolando", */
			/* "twitter": "fede cra", */
			/* "phone": formData.celular, */
			"street": formData.calle,
			"state": formData.provincia,
			"email": formData.email
		}

		try {
			const response = await axios.post(apiUrlContacto, bodyContactoData, { headers });
			// Manejar la respuesta de la API de Zoho Desk
			console.log('Creación de contacto correctamente en Zoho Desk'/* , response.data */);
			return response.data; // Puedes retornar los datos si es necesario
		} catch (error) {
			// Manejar cualquier error que ocurra durante la solicitud
			console.error('Error en la creación del contacto con la API de Zoho Desk------>:', error.message);
			throw error; // Puedes lanzar el error nuevamente o manejarlo aquí según tus necesidades
		}
	};

const crearTicketApiZoho = async (newContactId, formData, notasPedidos, nuevoAccessToken) => {
			const apiUrltickets = 'https://desk.zoho.com/api/v1/tickets';
			const headers = {
				'orgId': '826795874', // Si necesitas especificar el ID de la organización
				'Authorization': `Zoho-oauthtoken ${nuevoAccessToken}`,
				'Content-Type' : 'application/json',
			};

			const ticketData = {
				"contactId": newContactId,
				"subject": "Venta de vino AMW",
				/* "dueDate": "", */
				"departmentId": "897475000000245192",
				"channel": formData.email,
				"description": notasPedidos,
				/* "language": "", */
				"priority": "High",
				/* "classification": "",
				"assigneeId": "", */
				"phone": formData.celular,
				/* "category": "general", */
				"email": formData.email,
				"status": "Open",
			};

			try {
				const response = await axios.post(apiUrltickets, ticketData, { headers });
				// Manejar la respuesta de la API de Zoho Desk
				console.log('Creación de ticket exitosa en Zoho Desk a verr'/* , response.data */);
				return response.data; // Puedes retornar los datos si es necesario
			} catch (error) {
				// Manejar cualquier error que ocurra durante la solicitud
				console.error('Error al crear el ticket en Zoho Desk------>:', error.message);
				throw error; // Puedes lanzar el error nuevamente o manejarlo aquí según tus necesidades
			}
		}

const functions = {
			handleFormularioPreCompras2,
			llenarCarritos,
			compraCarritos2,
			cambioCodigoPorToken,
			renovarTokenDeAcceso,
			crearContactoApiZoho,
			crearTicketApiZoho,
		};

export default functions;