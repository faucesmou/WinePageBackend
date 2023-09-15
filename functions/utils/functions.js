import FormularioPreCompras from '../../database/models/formularioPreCompras.js';
import CompraCarritos from '../../database/models/compraCarritos.js';
import carritos from '../../database/models/carritos.js';
import axios from 'axios';

//Función para generar registro en la tabla FormularioPreCompras(SQL):
const handleFormularioPreCompras2 = async (formData) => {
	try {
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
		return {
			id: nuevoRegistro.id,
			createdAt: nuevoRegistro.createdAt,
			message: "Usuario registrado con éxito desde handleFormularioPreCompras !", usuario: nuevoRegistro
		};
	} catch (error) {
		console.error("Error al registrar el usuario desde handleFormularioPreCompras:", error);
		console.log('este es el formData---->', formData);
		console.log('este es el Error---->', error);
		return { message: "Error al registrar el usuario desde el handleFormularioPreCompras" };
	}
}
//Función para generar registro en la tabla Carritos(SQL):
const llenarCarritos = async (FormularioPreComprasId, fechaCompra, precioTotal) => {
	try {
		const nuevoCarrito = await carritos.create({
			FormularioPreComprasId: FormularioPreComprasId,
			fechaCompra: fechaCompra,
			precioTotal: precioTotal,
			// Otras columnas posibles para el carrito.
		});
		console.log(" Registro de Carrito insertado con éxito");
		return {
			id: nuevoCarrito.id,
			message: "data guardada en Carrito con éxito!"
		};
	} catch (error) {
		console.error("Error al insertar data en Carrito:", error);
		return { message: "Error al insertar data en tabla Carrito---> ", error: error };
	}
};
//Función para generar registro en la tabla CompraCarritos(SQL):
const compraCarritos2 = async (formDataCarrito, carritoId) => {
	try {
		
		// Recorremos los elementos del formDataCarrito y crea un registro para cada uno
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
	const clientId = process.env.CLIENT_ID_ZOHO;
	const clientSecret = process.env.CLIENT_SECRET_ZOHO;
	console.log('este es el clientId : <<<', clientId);
	console.log('este es el clientSecret : <<<', clientSecret);
	/* const clientId = '1000.NEZX419PEDPRC6XR3Q2RG73JH8HNGP';
	const clientSecret = '33a6703d4b254cd39a9ee9706bea8facb35a821823'; */
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
		const refreshToken = response.data.refresh_token; // Guardamos el token de actualización
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
	const x_mobex_api_key = process.env.X_MOBEX_API_KEY;
	const x_mobex_access_token = process.env.X_MOBEX_ACCESS_TOKEN;
	const dataIdentification = process.env.DATA_IDENTIFICATION
	console.log('este es el x_mobex_access_token  : <<<---->', x_mobex_access_token );

			let config = {
				headers: {
					"content-type": "application/json",
					"x-api-key": x_mobex_api_key,
					"x-access-token": x_mobex_access_token,
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
					identification: dataIdentification,
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
	const clientId = process.env.CLIENT_ID;
	const clientSecret = process.env.CLIENT_SECRET;
	const refresh_token = process.env.REFRESH_TOKEN;
	try {
		const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
			params: {
				refresh_token: refresh_token,
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
	};
//Función para crear el contacto en Zoho(debe hacerse antes de la creación del ticket):
const crearContactoApiZoho = async (nuevoAccessToken, formData, notasPedidos,) => {
		const apiUrlContacto = 'https://desk.zoho.com/api/v1/contacts';
		const orgId = process.env.ORG_ID;
		const headers = {
			'orgId': orgId, // Si necesitas especificar el ID de la organización
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
			const orgId = process.env.ORG_ID;
			const headers = {
				'orgId': orgId, 
				'Authorization': `Zoho-oauthtoken ${nuevoAccessToken}`,
				'Content-Type' : 'application/json',
			};

			const ticketData = {
				"contactId": newContactId,
				"subject": "Venta de vino AMW",
				/* "dueDate": "", */
				"departmentId": "897475000000245192",
				"channel": "Venta WEB",
				"description": notasPedidos,
				/* "language": "", */
				"priority": "High",
				/* "classification": "",
				"assigneeId": "", */
				"phone": formData.celular,
				/* "category": "general", */
				"email": formData.email,
				"status": "Open",
				"cf": {
					"cf_barrio": "barrio el pepe",
					"cf_codigo_postal": 5555
				}
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