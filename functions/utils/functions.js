import FormularioPreCompras from '../../database/models/formularioPreCompras.js';
import CompraCarritos from '../../database/models/compraCarritos.js';
import carritos from '../../database/models/carritos.js';
import axios from 'axios';

//Función para generar registro en la tabla FormularioPreCompras(SQL):
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
//Función para generar registro en la tabla Carritos(SQL):
const llenarCarritos = async (FormularioPreComprasId, fechaCompra, precioTotal) => {
	try {
		
		// Crea un registro en la tabla Carritos
		const nuevoCarrito = await carritos.create({
			FormularioPreComprasId: FormularioPreComprasId,
			fechaCompra: fechaCompra,
			precioTotal: precioTotal,
			// Otras columnas específicas del carrito
		});
		console.log(" Registro de Carrito insertado con éxito");
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
//Función para generar registro en la tabla CompraCarritos(SQL):
const compraCarritos2 = async (formDataCarrito, carritoId) => {
	try {
		
		// Recorre los elementos del formDataCarrito y crea un registro para cada uno
		for (const item of formDataCarrito) {
			const nuevoRegistro = await CompraCarritos.create({
				image: item.image,
				text: item.text,
				price: item.price,
				quantity: item.quantity,
				carritosId: carritoId,
			});
			console.log("Registro en CompraCarritos insertado con éxito.");
		}
		return { message: "Registros insertados con éxito desde CompraCarritos" };
	} catch (error) {
		console.error("Error al insertar registros en la Tabla CompraCarritos:", error);
		return { message: "Error al insertar registros desde compraCarritos" };
	}
};
//Función para obtener el refreshToken (se ejecutó una sola vez):
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
		// Ahora tenemos el accessToken para usar en las llamadas a la API de Zoho Desk.
		return {
		accessToken: accessToken,
		refreshToken: refreshToken,
		};
	} catch (error) {
		console.error('Error al intercambiar el código de autorización por el accesToken y refreshToken. Error:', error);
		throw error;
	}
};
//Función para consultar a Mobex:
const consultaMobex = async () => {
	const urlCheckoutMobbex = "https://api.mobbex.com/p/checkout";

			let config = {
				headers: {
					"content-type": "application/json",
					"x-api-key": "F61UV8kikz7Hw0fa5zmO5M0iTeb~c5ycIWl_qmIq",
					"x-access-token": "a188450f-f26c-4577-85fe-eb8dabb87cd5",
				}
			};
			const data = {
				total: 888,
				description: "Descripción de la compra de vinos realizada en Mobex!",
				currency: "ARS",
				reference: "12345678",
				test: true,
				return_url: "Url a la que será enviado el usuario al finalizar el pago",
				webhook: "http://innvita.com.ar/mobbex/webhook",
				item: [{
					image: "http://www.mobbex.com/wp-content/uploads/2019/03web_logo.png",
					quantity: 2,
					description: "Mi producto",
					total: 250
				},],
				sources: ["visa", "mastercard"],
				installments: [],
				customer: {
					email: "cristian.elias@andessalud.ar",
					identification: "12123123",
					name: "Cristian Elias"
				},
				timeout: 5
			};
			const dataString = JSON.stringify(data);
			try {
			let response = await axios.post(urlCheckoutMobbex, dataString, config);
			return response;
			} catch (error) {
				console.error('Error en la consulta a Mobex------>:', error.message);
				throw error; 
			}
}
//Función para actualizar el token de acceso (se ejecuta en cada compra):
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
//Función para crear el contacto en Zoho(debe hacerse antes de la creación del ticket):
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
			console.log('Creación exitosa del contacto en Zoho Desk');
			return response.data; 
		} catch (error) {
			console.error('Error en la creación del contacto con la API de Zoho Desk. Error.message--->:', error.message);
			throw error; 
		}
	};
//Función para crear el Ticket de seguimiento en Zoho:
const crearTicketApiZoho = async (newContactId, formData, notasPedidos, nuevoAccessToken) => {
			const apiUrltickets = 'https://desk.zoho.com/api/v1/tickets';
			const headers = {
				'orgId': '826795874', 
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
				console.log('Creación exitosa del ticket en Zoho Desk.'/* , response.data */);
				return response.data;
			} catch (error) {
				console.error('Error al crear el ticket en Zoho Desk. Error.message------>:', error.message);
				throw error;
			}
		}
//Se exportan todas las funciones en el objeto functions: 
const functions = {
			handleFormularioPreCompras2,
			llenarCarritos,
			compraCarritos2,
			cambioCodigoPorToken,
			renovarTokenDeAcceso,
			crearContactoApiZoho,
			crearTicketApiZoho,
			consultaMobex,
		};

export default functions;