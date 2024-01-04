import dotenv from 'dotenv';
dotenv.config();
import FormularioPreCompras from '../../database/models/formularioPreCompras.js';
import CompraCarritos from '../../database/models/compraCarritos.js';
import ProductosDisponibles from '../../database/models/ProductosDisponibles.js';
import carritos from '../../database/models/carritos.js';
import axios from 'axios';
import { Op } from 'sequelize';
//22/12
import readXlsxFile from 'read-excel-file/node';
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

//26/12 NODEMAILER:
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
	host: 'email-smtp.us-west-2.amazonaws.com',
	port: 2587,// El puerto SMTP, generalmente es 587
	secure: false, // true para usar SSL/TLS, false para usar conexiones no seguras
	auth: {
		user: process.env.SMTP_user_name2,
		pass: process.env.SMTP_password2,
		/* Este es el del Marce  user:'AKIAQLGHJJBSF26OLVFQ', */
		/*  Este es el del Marce  pass:'BKUq6Uy/3z89pQNC+wqtJhLVZ51hik2K2/fSwWOm+eDR', */
	},
});

/* import { fileURLToPath } from 'url'; */
import { dirname, join } from 'path';
/* import fs from 'fs/promises'; */
import fs from 'fs';
import exceljs from 'exceljs';
import multer from 'multer';
import path from 'path';
import JSZip from 'jszip';
import * as xlsx from 'xlsx';

import mercadopago from 'mercadopago';

//SEQUELIZE
/* import Sequelize from 'sequelize';
import db from "../config/db.js"; */

const cargarProductos2 = async (archivoExcel, res) => {
	try {
		console.log('Tipo de archivoExcel:', typeof archivoExcel);
		console.log('Contenido de archivoExcel:', archivoExcel);

		if (!archivoExcel) {
			return res.status(400).send('Debes cargar un archivo Excel.');
		}

		// Método con readXlsxFile
		const rutaArchivo = `${archivoExcel.path}`;
		console.log('rutaArchivo es esto!!-->:', rutaArchivo);
		const workbook = await readXlsxFile(rutaArchivo);
		console.log('workbook es esto:', workbook);

		console.log('Empezando a iterar sobre las filas y agregando productos');

		// Itera sobre las filas y agrega los productos a la base de datos
		for (let rowNumber = 1; rowNumber < workbook.length; rowNumber++) {
			const rowData = workbook[rowNumber];
			console.log('Creando un nuevo registro en la base de datos agregando productos');

			// Asegúrate de ajustar los índices según la estructura de tu archivo Excel
			await ProductosDisponibles.create({
				text: rowData[0],
				subText: rowData[1],
				price: rowData[2],
				stockDisponible: rowData[3],
				image: rowData[4],
			});
		}
		return {
			success: true,
			message: 'Productos cargados exitosamente.',
		}
	} catch (error) {
		console.error('Error al cargar productos desde cargarProductos2:', error);
		return {
			success: false,
			message: 'Error al cargar productos desde cargarProductos2.',
			error: error.message,
		};
	}
};

//Función para generar registro en la tabla FormularioPreCompras(SQL):
const handleFormularioPreCompras2 = async (formData, notaPedido) => {
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
			notaPedido: notaPedido,
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

		const generateExternalReference = () => {
			let d = new Date().getTime();
			let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				let r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
			console.log("este ES EL UUID-----> ", uuid);
			return uuid;
		};

		const external_reference = generateExternalReference()
		console.log("EL external_reference es: --------$$> ", external_reference);
		console.log("Consulta SQL para la inserción:", carritos.create.toString());
		const nuevoCarrito = await carritos.create({
			FormularioPreComprasId: FormularioPreComprasId,
			fechaCompra: fechaCompra, //AJUSTAR
			precioTotal: precioTotal,
			external_reference: external_reference,
			estadoCompra: "NO PAGADO",
		});
		console.log("la fecha de fechaCompra es: ----> ", fechaCompra);
		console.log("external_reference es: --------$$> ", external_reference);
		console.log("El nuevoCarrito DE CARRITOS ES: --------$$> ", nuevoCarrito);

		console.log(" Registro de Carrito insertado con éxito");
		return {
			id: nuevoCarrito.id,
			external_reference: nuevoCarrito.external_reference,
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
		let nuevoRegistroId;

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
			nuevoRegistroId = nuevoRegistro ? nuevoRegistro.id : undefined;
			/* ACÁ TENGO QUE GUARDAR CADA ID DE CADA REGISTRO QUE SE CREA POR CADA PRODUCTO Y LUEGO PASARLO A MERCADO PAGO UNO POR UNO.  */
		}

		return {
			id: nuevoRegistroId,
			message: "Registros insertados con éxito desde CompraCarritos"
		};
	} catch (error) {
		console.error("Error al insertar registros en la Tabla CompraCarritos:", error);
		return {
			/* id: nuevoRegistro.id, */
			message: "Error al insertar registros desde compraCarritos"
		};
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
	console.log('este es el x_mobex_access_token  : <<<---->', x_mobex_access_token);

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

	console.log(' entrando a renovarTokenDeAcceso------------------->');
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
const crearContactoApiZoho = async (nuevoAccessToken, formData, /* notaPedido, */) => {

	console.log(' entrando a crearContactoApiZoho------------------->');
	const apiUrlContacto = 'https://desk.zoho.com/api/v1/contacts';
	const orgId = process.env.ORG_ID;
	const headers = {
		'orgId': orgId, // Si necesitas especificar el ID de la organización
		'Authorization': `Zoho-oauthtoken ${nuevoAccessToken}`,
		'Content-Type': 'application/json',
	};
	const bodyContactoData = {
		"zip": formData.cp,
		"lastName": formData.nombreApellido,
		"country": "ARGENTINA",
		"city": formData.localidad,
		"mobile": formData.celular,
		"description": 'esta es la descripción sapee'/* notaPedido */,
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
const crearTicketApiZoho = async (newContactId, formData, formDataCarrito, precioFinal, /* notaPedido, */ nuevoAccessToken) => {
	console.log('Llamando a crearTicketApiZoho con newContactId:', newContactId);

	let description = [];
	formDataCarrito.forEach(item => {
		description.push(item.text);
	});

// Formatear la descripción como cadena
let formattedDescription = description.join(' - ');



	let unidades = [];
	formDataCarrito.forEach(item => {
		unidades.push({
			Producto: item.text,
			Precio: `$${item.price}`,
			Cantidad: item.quantity
		});
	});
	/*  console.log('este es el unidades----->:', unidades); */

	// Utiliza el método map para transformar cada objeto en una cadena
	let unidadesFormateadas = unidades.map((item) => {
		return `${item.Producto} - Cantidad: ${item.Cantidad} - Precio: ${item.Precio}`;
	});

	// Únelos con un salto de línea------------------------------------------->>>>>>>>>>>>>>>>
	let resultadoFormateado = unidadesFormateadas.join("\n");

	// Muestra el resultado
	/* console.log('este es el resultadoFormateado.----->', resultadoFormateado); */


	const apiUrltickets = 'https://desk.zoho.com/api/v1/tickets';
	const orgId = process.env.ORG_ID;
	const headers = {
		'orgId': orgId,
		'Authorization': `Zoho-oauthtoken ${nuevoAccessToken}`,
		'Content-Type': 'application/json',
	};

	const ticketData = {
		"contactId": newContactId,
		"subject": "Venta Web - Antonio Mas Wines-",
		/* "dueDate": "", */
		"departmentId": "897475000000245192",
		/* "departmentId": "897475000000006907", */
		"channel": "Venta WEB de AMW",
		"description": resultadoFormateado,
		/* "language": "", */
		"priority": "High",
		/* "classification": "",
		"assigneeId": "", */
		"phone": formData.celular,
		/* "category": "general", */
		"email": formData.email,
		"status": "Open",
		"cf": {
			"cf_calle": formData.calle,
			"cf_numero_de_domicilio": formData.numero,
			"cf_manzana": formData.manzana,
			"cf_barrio": formData.barrio,
			"cf_localidad": formData.localidad,
			"cf_provincia": formData.provincia,
			"cf_codigo_postal": formData.cp,
			"cf_precio_total": precioFinal,
			"cf_nota_del_cliente": formData.notaPedido,
			"cf_nombres_de_los_productos": formattedDescription/*  description */,
			"cf_cantidad_de_unidades": resultadoFormateado,
		}
	};
	try {
		const response = await axios.post(apiUrltickets, ticketData, { headers });
		console.log('Creación exitosa del ticket en Zoho Desk.'/*,  response.data */);
		const responseDataWithSuccess = {
			success: true,
			...response.data
		  };

		return responseDataWithSuccess;
	} catch (error) {
		console.error('Error al crear el ticket en Zoho Desk. Error.message------>:', error.message);
		return { success: false, error: error.message };
	}
};
const actualizarColumnaCreatedTicket = async (externalReference) => {

	console.log(' entrando a actualizarColumnaCreatedTicket');
	try {
	  const [rowsUpdated] = await carritos.update(
		{ ticket_created: 1 },
		{ where: { external_reference: externalReference } }
	  );
  
	  if (rowsUpdated === 0) {
		// Esto podría indicar que no se encontró ninguna fila para actualizar
		console.log("No se encontró ningún carrito -ACTUALIZAR COLUMNA CREATE TICKET- para actualizar.");
		return { success: false, message: "No se encontró ningún carrito -ACTUALIZAR COLUMNA CREATE TICKET-  para actualizar." };
	  }
  
	  console.log('Actualización de columna ticket_created actualizada con éxito!');
	  return { success: true, message: 'Actualización de columna ticket_created actualizada con éxito!' };
	} catch (error) {
	  console.error('Error en la Actualización de columna ticket_created, revisar. Error:', error);
	  return { success: false, error: error.message };
	}
  };
  

const crearLinkMercadoPago = async (FormularioPreComprasId, mes, precioFinal, external_reference, itemsParaMP) => {

	console.log('entrando a crearLinkMercadoPago----->');
	try {

		/*  let access_token = dotenv.parsed.MERCADO_PAGO_ACCESS_TOKEN Cristian lo usa así.  */
		/* let access_token = process.env.MERCADO_PAGO_ACCESS_TOKEN; */

		////ESTE ANDA: ESTE ES CON LA CUENTA falsa DE MP DE GONZALO   

		/* ESTE ANDA: const access_token = "TEST-3580700093210676-111510-cb2322dd36929bb50fd937c9c08283e9-1549088587"; */

	    /* const access_token = "APP_USR-5071477402845741-102318-7408934d370736146f413afdc6ce846e-359490283"  */;

		/*  const access_token = "TEST-7103253574138235-112715-0050216c766b1aad0b386ee747be2979-1552387538" ; */

		//cuenta oficial Y REAL de AMW: 
		const access_token = "APP_USR-7103253574138235-112715-8c7d630e90d522b3f789034feb415df5-1552387538";


		mercadopago.configure({
			access_token
		})

		let preference = {
			back_urls: {
				failure: `https://www.antoniomaswines.createch.com.ar/failure/${external_reference}`,
				pending: `https://www.antoniomaswines.createch.com.ar/pending/${external_reference}`,
				success: `https://www.antoniomaswines.createch.com.ar/success/${external_reference}`,
			},

			notification_url: `https://amw.createch.com.ar/api/notification/${external_reference}`,


			items: itemsParaMP/* [
                {
                    id: FormularioPreComprasId,
                    title: `el titulo es cristian castro: `,
                    description: `conceptos a pagar durante el mes de: `+ mes,
                    picture_url: "https://www.antoniomaswines.createch.com.ar/assets/imgs/Almarada.png",
                    category_id: "category",
                    currency_id: "ARS",
                    quantity: 1,
                    unit_price: precioFinal,
                }
            ] */,
			payment_methods: {
				excluded_payment_methods: [
					{}
				],
				excluded_payment_types: [
					{}
				]
			},
			external_reference: external_reference
		}
		/* console.log('este es el preference: ---->>>>', preference) */
		let link = await mercadopago.preferences.create(preference)
		/* 	console.log("esta es la respuesta completa de mercado pago: el body completo del link: ", link ); */
		return link.body.init_point
	} catch (error) {
		console.error(error)
	}
}

const crearOrden = async (req, res) => {
	try {
		let access_token = "TEST-3580700093210676-111510-cb2322dd36929bb50fd937c9c08283e9-1549088587";
		mercadopago.configure({
			access_token
		});

		const resultadoMercadoPago = await mercadopago.preferences.create({
			items: [
				{
					id: 99,
					title: `mansa compu`,
					description: `conceptos a pagar durante el mes de:noviembre `,
					category_id: "tecnología",
					currency_id: "ARS",
					quantity: 1,
				}
			],
		});
		/* console.log("este es el resultado de la funcion crear Orden: --> ", resultadoMercadoPago); */
		res.send("creando orden");
	} catch (error) {
		console.error("Error en la creación de la orden de la función crearOrden!->>:", error);
		res.status(500).send("Error en la creación de la orden");
	}
};

const crearOrdenMercadoPago = async () => {

	console.log('entrando a crearOrdenMercadoPago----->');
	try {
		/* 		let access_token = "TEST-3580700093210676-111510-cb2322dd36929bb50fd937c9c08283e9-1549088587"; */
		// Step 2: Initialize the client object
		const client = new MercadoPagoConfig({ accessToken: 'TEST-3580700093210676-111510-cb2322dd36929bb50fd937c9c08283e9-1549088587', options: { timeout: 5000, idempotencyKey: 'abc' } });

		// Step 3: Initialize the API object
		const payment = new Payment(client);

		const body = {
			transaction_amount: 120.34,
			description: 'descripción del queso roquefort',
			payment_method_id: 'visa',
			payer: {
				email: 'lacra@gmail.com'
			},
		};

		const resultadoMercadoPago = await payment.create({ body });
		/* console.log("Resultado de MercadoPago:-->", resultadoMercadoPago); */

		return resultadoMercadoPago;
	} catch (error) {
		console.error("Error en la creación de la orden crearOrdenMercadoPago:", error);
		throw error;
	}
};

const consultaPagoMerchantOrder = async (orderId) => {
	console.log('entrando a consultaPagoMerchantOrder----------->');
	// Hacer una solicitud a la API de Mercado Pago para obtener detalles sobre la orden de pago
	const apiUrl = `https://api.mercadopago.com/merchant_orders/${orderId}`;

	try {
		const responseMerchant = await axios.get(apiUrl, {
			headers: {
				/* 'Authorization': `Bearer TEST-3580700093210676-111510-cb2322dd36929bb50fd937c9c08283e9-1549088587`, */
				'Authorization': `Bearer APP_USR-7103253574138235-112715-8c7d630e90d522b3f789034feb415df5-1552387538`,
				'ContentType': 'application/json',
			},
		});

		const orderDetails = responseMerchant.data;
		/* 			console.log('Detalles de responseMerchant------------------>>><<<:', responseMerchant); */
		/* console.log('Detalles de la orden:', orderDetails); */
		/* console.log('%%%$$$$$%%%$%%%$$//&&((/y(/&(/&(/----> ---> orderDetails:', orderDetails); */
		let status
		if (orderDetails.status === 'opened') {
			// La orden está abierta, accedemos al estado de status directamente:
			status = orderDetails.status;
			console.log('Orden aun abierta (opened), status-->>>:', status);
			return {
				orderDetails: orderDetails,
				status: status,
				message: "PAGO PENDIENTE DE PAGO"
			}
		}
		else if (orderDetails.status === 'closed') {
			// La orden está cerrada es porque posiblemente esté pagada, puedes acceder al estado entrando a payments
			status = orderDetails.payments[0].status;
			console.log('%%%$$$$$%%%$%%%$$----> ---> la orden en este caso está cerrada o closed, status-->>>:', status);
			// Aquí puedes verificar el estado del pago y realizar acciones en consecuencia
			if (status === 'paid' || status === 'approved') {
				// El pago está confirmado;
				/* console.log('El pago está confirmado y recontra confirmado por mercado pago pa &%/&$(/).'); */
				return {
					orderDetails: orderDetails,
					status: status,
					message: "PAGO CONFIRMADO BILLETERA DE RICKI FORT!"
				};
			}
			else if (status === 'pending') {
				// El pago está pendiente de pago (probablemente eligió pago fácil o rapi pago en efectivo);
				return {
					orderDetails: orderDetails,
					status: status,
					message: "PAGO PENDIENTE DE PAGO"
				};
			}

		} else {
			// El pago no está confirmado o ha fallado
			/* 	console.log('El pago no está confirmado o ha fallado.'); */
			// Puedes realizar acciones adicionales según sea necesario
			status = 'unknown';
			return {
				orderDetails: orderDetails,
				status: status,
				message: "Esta vez no entró el pago terremoto cósmico"
			};
		}

	} catch (error) {
		console.error('Error al consultar detalles de la orden desde consultaPagoMerchantOrder:', error);
		// Manejar el error según sea necesario
	}

};
const consultaPagoPaymentOrder = async (paymentId) => {
console.log('entrando a consultaPagoPaymentOrder----------->');
	// Hacer una solicitud a la API de Mercado Pago para obtener detalles sobre la orden de pago
	const apiUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;

	try {
		const responsePayment = await axios.get(apiUrl, {
			headers: {
				'Authorization': `Bearer APP_USR-7103253574138235-112715-8c7d630e90d522b3f789034feb415df5-1552387538`,
				/* 'Authorization': `Bearer TEST-3580700093210676-111510-cb2322dd36929bb50fd937c9c08283e9-1549088587`, */

			},
		});

		const orderDetails = responsePayment.data;
		/* console.log('Detalles de la orden:', orderDetails); */
		/* 	console.log('Detalles de responsePayment------------------>>><<<:', responsePayment); */
		const status = orderDetails.status;
		console.log('%%%$$$$$%%%$%%%$$----> ---> status:', status);
		// Aquí puedes verificar el estado del pago y realizar acciones en consecuencia
		if (status === 'paid' || status === 'approved') {
			// El pago está confirmado
			console.log('El pago está confirmado.');
			// Realizar acciones adicionales, como actualizar tu base de datos, enviar confirmaciones, etc.
			return {
				orderDetails: orderDetails,
				status: status,
				message: "PAGO CONFIRMADO BILLETERA DE BILL GATES!"
			};
		} else {
			// El pago no está confirmado o ha fallado
			console.log('El pago no está confirmado o ha fallado.');
			// Puedes realizar acciones adicionales según sea necesario
			return {
				orderDetails: orderDetails,
				status: status,
				message: "esta vez no entró el pago terremoto cósmico"
			};
		}

	} catch (error) {
		console.error('Error al consultar detalles de la orden desde consultaPagoPaymentOrder:', error);
		// Manejar el error según sea necesario
	}

};

const guardarPaymentId = async (paymentId, externalReference) => {

	console.log('entrando en guardarPaymentId para el guardado de PAYMENT ID en la base de datos----->');

	if (!paymentId) {
		console.log('paymentId no encontrada en la respuesta de mercado pago GALPERÍN GALÁCTICO .esto es handleNotification');
		return {
			message: "paymentId no encontrada GALPERÍN GALÁCTICO!"
		};
		/* return res.status(404).json({ success: false, error: 'paymentId no encontrada GALPERÍN GALÁCTICO .esto es handleNotification' }); */
	}
	try {

		// Verificar si ya existe el paymentId
		/* const carritoExistente = await carritos.findOne({
			where: { external_reference: externalReference }
		});

		if (carritoExistente && carritoExistente.mercadoPagoPaymentId === paymentId) {
			console.log('El paymentId ya existe y es igual al nuevo, no es necesario actualizar');
			return {
				message: "El paymentId ya existe y es igual al nuevo, no es necesario actualizar"
			};
		} */ //y si no es igual al nuevo o el registro está en blanco se hace lo siguiente: 

		console.log('paymentId -->:', paymentId)

		// Actualizar solo si el paymentId es diferente
		/* 	await carritos.update(
				{ mercadoPagoPaymentId: paymentId },
				{ where: { external_reference: externalReference, mercadoPagoPaymentId: { [Op.ne]: paymentId } } }
				);
				
				console.log('Actualización de columna mercadoPagoPaymentId actualizada con éxito!');
				return {
					message: "Actualización de columna mercadoPagoPaymentId actualizada con éxito."
				};
			} catch (error) {
				console.error('Error en la Actualización de columna mercadoPagoPaymentId, lo siento perro, a revisar. error:', error);
				return {
					message: "Error en la Actualización de columna mercadoPagoPaymentId, lo siento perro, a revisar"
				}; */

		await carritos.update(
			{ mercadoPagoPaymentId: paymentId },
			{ where: { external_reference: externalReference } }
		);
		console.log('Actualización de columna mercadoPagoPaymentId actualizada con éxito!');
		return {
			message: "Actualización de columna mercadoPagoPaymentId actualizada con éxito."
		};

	} catch (error) {
		console.error('Error en la Actualización de columna mercadoPagoPaymentId, lo siento perro, a revisar. error:', error);
		return {
			message: "Error en la Actualización de columna mercadoPagoPaymentId, lo siento perro, a revisar"
		}
	};
};
const guardarZohoTicket = async (res, ticketNumberZoho, pasandoExternalReference) => {
	console.log('Llamando a guardarZohoTicket------>');


	console.log('empezando la búsqueda en la base de datos del registro para agregar el zohoNumeroTicket');
	console.log('pasandoExternalReference es--->: ', pasandoExternalReference)
	try {
		const carritoExistenteZoho = await carritos.findOne({
			where: { external_reference: pasandoExternalReference }
		});

		if (!carritoExistenteZoho) {
			console.log("guardarZohoTicket: Carrito no encontrado");
			return res.status(404).json({
				success: false,
				message: "Carrito no encontrado desde la función guardarZohoTicket"
			});
		}

		console.log('ticketNumberZoho:', ticketNumberZoho);

		await carritos.update(
			{ zohoNumeroTicket: ticketNumberZoho },
			{ where: { external_reference: pasandoExternalReference } }
		);

		console.log('Actualización de columna ticketNumberZoho actualizada con éxito!');
		return res.status(200).json({
			success: true,
			message: 'Actualización de columna ticketNumberZoho actualizada con éxito!'
		});

	} catch (error) {
		console.error('Error en la Actualización de columna ticketNumberZoho, revisar. Error:', error);
		return res.status(500).json({
			success: false,
			error: error.message
		});
	}
};
const enviarCorreo = async (correoDestino, asunto, contenido) => {
	console.log('ENTRANDO A ENVIAR CORREO:');
	console.log('correoDestino:', correoDestino);
	console.log('asunto:', asunto);
	const mensaje = {
		from: 'ventas@antoniomaswines.com',
		to: correoDestino,
		subject: asunto,
		text: contenido,
	};

	try {
		// Envía el correo electrónico
		const info = await transporter.sendMail(mensaje);
		console.log('Correo enviado:', info.response);
		return { success: true, message: 'Correo enviado con éxito' };
	} catch (error) {
		console.error('Error al enviar el correo:', error);
		return { success: false, message: 'Error al enviar el correo' };
	}
};
const actualizarColumnaEmailSent = async (externalReference) => {
	console.log('ENTRANDO A actualizarColumnaEmailSent:');
	// prueba cambiando para solcionar el IF //
	
	//

	const carrito = await carritos.findOne({ where: { external_reference: externalReference } });
	if (!carrito) {
		console.log("No se encontró en ACTUALIZAR COLUMNA EMAIL ningún carrito para actualizar.");
		return { success: false, message: "No se encontró EN ACTUALIZAR COLUMNA EMAIL ningún carrito para actualizar." };
	  }
	  
	try {
	  const [rowsUpdated] = await carritos.update(
		{ email_sent: 1 },
		{ where: { external_reference: externalReference } }
	  );
  
	  if (rowsUpdated === 0) {
		// Esto podría indicar que no se encontró ninguna fila para actualizar
		console.log("No se encontró -ACTUALIZAR COLUMNA EMAIL- ningún carrito para actualizar.");
		return { success: false, message: "No se encontró -ACTUALIZAR COLUMNA EMAIL- ningún carrito para actualizar." };
	  }
  
	  console.log('Actualización de columna email_sent actualizada con éxito!');
	

	  return { success: true, message: 'Actualización de columna email_sent actualizada con éxito!' };
	} catch (error) {
	  console.error('Error en la Actualización de columna email_sent, revisar. Error:', error);
	 
	  return { success: false, error: error.message };
	}
  };





//Se exportan todas las funciones en el objeto functions: 
const functions = {
	handleFormularioPreCompras2,
	llenarCarritos,
	compraCarritos2,
	cambioCodigoPorToken,
	renovarTokenDeAcceso,
	crearContactoApiZoho,
	crearTicketApiZoho,
	crearLinkMercadoPago,
	crearOrdenMercadoPago,
	crearOrden,
	consultaMobex,
	consultaPagoMerchantOrder,
	consultaPagoPaymentOrder,
	guardarPaymentId,
	guardarZohoTicket,
	cargarProductos2,
	enviarCorreo,
	actualizarColumnaCreatedTicket,
	actualizarColumnaEmailSent,
};

export default functions;

/* const nodemailer = require('nodemailer'); */

// Configuración de nodemailer
/* const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'gonzalomorresi@gmail.com',
	  pass: '15Disciplina15',
	}
  }); */

//email express a.m.w. 

/* import { MercadoPagoConfig, Payment } from 'mercadopago'; */

// Lee el archivo Excel
/*  console.log('empezando a crear workbook:');
 const workbook = new exceljs.Workbook();
 console.log('empezando el await workbook.xlsx.load(archivoExcel.buffer)'); */
/* await workbook.xlsx.load(archivoExcel.buffer); */
/*  await workbook.xlsx.load(archivoExcel.path); */