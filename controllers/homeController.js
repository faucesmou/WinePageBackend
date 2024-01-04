import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
//import db from "../database/config/db.js"; 
import Usuario from '../database/models/Usuario.js';
import FormularioPreCompras from '../database/models/formularioPreCompras.js';
import carritos from '../database/models/carritos.js';
import CompraCarritos from '../database/models/compraCarritos.js';
import { response } from 'express';
import functions from '../functions/utils/functions.js';
import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
/* import path from 'path'; */
//multer para manejar archivos excel: 
/* import multer from 'multer'; */

//exceljs:

import ProductosDisponibles from '../database/models/ProductosDisponibles.js';

//MUTEX PARA QUE PROBLEMAS DE CONCURRENCIA:
import { Mutex } from 'async-mutex';
const mutex = new Mutex();

// INICIO DEL MÓDULO: 

const controller = {

// tuControlador.js
cargarProductos: async (req, res) => {
  // Lógica para cargar productos desde el archivo
  try {
  const archivoExcel = req.file;
  const rutaArchivoExcel = `../../uploads/${archivoExcel.filename}`;
  const cargarProductosResponse = await functions.cargarProductos2(archivoExcel, res);
 
  if (cargarProductosResponse.success) {
  console.log('<--Productos cargados exitosamente-->', cargarProductosResponse.message);
  res.status(200).json({
	success: true,
	message: 'Datos registrados con éxito!',
});
  }  else {
	console.log('Error al cargar Productos desde cargarProductos2-->: ', cargarProductosResponse.message);
	console.error('Detalles del error:', cargarProductosResponse.error);
	res.status(500).json({
		success: false,
		message: 'Error en el controlador cargarProductos2.',
		error: cargarProductosResponse.error,
	  });
  }

} catch (error) {
	console.log('error en cargarProductos desde cargarProductos-->: ', error);
	/* res.status(500).send('Error al cargar productos desde cargar Productos.'); */
	res.status(500).json({
		success: false,
		message: 'Error en el controlador cargarProductos.',
	  });
	}
},
	getLanding: (req, res) => {
		/* res.send('la conexión es correcta desde controllers') */

		let landingPageURL = 'https://www.antoniomaswines.createch.com.ar/';
		res.redirect(landingPageURL);
	},
	submitEmailFooter: (req, res) => {
		const formData3 = req.body;
		res.json({ message: 'Email recibido con éxito el cart State desde el controller de BackEnd, este es el formData: ', formData3 });
	},
	registrarUsuario: async (req, res) => {
		try {
			const formData = req.body
			console.log('este es el formData desde el try---->', formData);
			// Creamos un nuevo registro de usuario utilizando el modelo Usuario y los datos del formData:
			const nuevoUsuario = await Usuario.create({
				usuario: formData.nombre,
				apellido: formData.apellido,
				correo: formData.correo,
				asunto: formData.asunto,
				rango_de_horario: formData.mensaje,
			});
			// Guarda el nuevo registro en la base de datos
			/*  await nuevoUsuario.save(); */ // este se usa en caso de usar Usuario.build en vez de Usuario.create
			// Si el usuario se crea correctamente, puedes enviar una respuesta de éxito
			res.json({ message: "Usuario registrado con éxito!", usuario: nuevoUsuario });
		} catch (error) {
			console.error("Error al registrar el usuario:", error);
			console.log('este es el formData---->', formData);
			// Si hay un error, envía una respuesta de error
			res.status(500).json({ message: "Error al registrar el usuario" });
		}

	},
	submitCarritoCompras: async (req, res) => {
		let release;
		try {

			// Adquirir el Mutex antes de ejecutar el código crítico
			release = await mutex.acquire();

			//Recepción de datos desde el frontEnd: Se dividen en 2 Grupos:
			let formData = req.body.paymentFormData; //Datos del formulario del usuario (nombre apellido, email, celular, cp, calle, numero, manzana, barrio, localidad).
			/* console.log('formData (línea57) es el siguiente: ---> ', formData); */
			let formDataCarrito = req.body.cartArray;// Datos del carrito (vinos,cantidades, precio de cada unidad, imagen, nota del pedido).
			console.log('formData (línea109) es el siguiente: --------U----> ', formData);
			console.log('formDataCarrito (línea58) es el siguiente: ---> ', formDataCarrito);
			let pruebaTipo = formDataCarrito[0].price
			console.log('pruebaTipode formDataCarrito formDataCarrito[0].price (línea107) es el siguiente: y es tipo ---> ', typeof pruebaTipo);

			// Obtenemos el precio total de la compra cartItems utilizando el método map:
			const precioTotal = formDataCarrito.reduce((total, item) => {
				const itemPrice = /* parseFloat */(item.price) * item.quantity;
				return total + itemPrice;
			}, 0);
			const precioFinal = precioTotal/* .toFixed(3) */;
			console.log('precioFinal de la línea 66:', precioFinal);
			console.log('El typeof precioFinal de la línea 66 es:', typeof precioFinal);
			// Obtenemos la nota redactada en el carrito de compras: Podemos hacerlo de 2 maneras: 
			/* let notasPedidos = [];
			formDataCarrito.forEach(item => {
			  notasPedidos.push(item.notaPedido);
			}); */
			console.log('formDataCarrito del controlador submitCarritoCompras :', formDataCarrito);
			
			let notaPedido = formDataCarrito[0].notaPedido;
			console.log(' SUBMIT CARRITO DE COMPRAS: notaPedido del formDataCarrito[0].notaPedido; :', notaPedido);

			// Crear registro con los datos del usuario en la tabla FormularioPreCompras:
			const formularioPreComprasDataResponse = await functions.handleFormularioPreCompras2(formData, notaPedido);

			// Obtener el ID del FormularioPreCompras: 
			const FormularioPreComprasId = await formularioPreComprasDataResponse.id;
			// Obtener la fechaCompra del FormularioPreCompras: 
			const fechaCompra = await formularioPreComprasDataResponse.createdAt;

			// Crear registro en tabla Carritos: 
			const llenarCarritoDataResponse = await functions.llenarCarritos(FormularioPreComprasId, fechaCompra, precioFinal);

			const external_reference = llenarCarritoDataResponse.external_reference;
			

			// Obtener el ID del registro creado en la tabla Carritos(contiene un resumen de la compra):
			const carritoId = await llenarCarritoDataResponse.id;

			// Crear registro de productos en la tabla CompraCarritos (contiene el detalle de la compra):
			const compraCarritosDataResponse = await functions.compraCarritos2(formDataCarrito, carritoId);

			const compraCarritoId = compraCarritosDataResponse.id;
			
			//MERCADO-PAGO---------------------------------------------------------->>>

			// Si la respuesta de MERCADO PAGO es =! NULL guardamos los datos y creamos el ticket en Zoho: 


			// Crear un objeto Date a partir de la cadena de fecha
			const fechaObj = new Date(fechaCompra);
			// Extraer las partes individuales de la fecha 
			const año = fechaObj.getFullYear();
			const mes = fechaObj.getMonth() + 1; // Sumar 1 porque los meses en JavaScript van de 0 a 11
			const día = fechaObj.getDate();
			const hora = fechaObj.getHours() - 3;// Restar 3 porque el horario es de argentina
			const minutos = fechaObj.getMinutes();
			const segundos = fechaObj.getSeconds();

			// Imprimir o usar las variables según sea necesario
			console.log(`Año: ${año}`);


			//Armado de items para enviar a Mercado Pago:

			const itemsParaMP = formDataCarrito.map(item => {
				
				return {
					id: compraCarritoId, //consultarrr porque cada registro tiene su propio id. y si uso el de la base de datos tengo que llamarlo o crear uno por mi cuenta
					title: item.text,
					description: item.text,
					picture_url: item.image,
					category_id: "vino",
					currency_id: "ARS",
					quantity: item.quantity,
					unit_price: item.price/* precioPrevio */,
				};
			});
			console.log('es es el itemsParaMP --->>>-->-->--->>', itemsParaMP)
			const linkMercadoPagoResponse = await functions.crearLinkMercadoPago(FormularioPreComprasId, precioFinal, mes, external_reference, itemsParaMP);
			if (linkMercadoPagoResponse !== null) {

				console.log("Este es el linkMercadoPagoResponse: -->", linkMercadoPagoResponse);

				//ZOHO---------------------------------------------------------->>>

				//silencio esta renovación de ticket MOMENTÁNEAMENTE: 
				//Se renueva el token:
				/* const nuevoAccessToken = await functions.renovarTokenDeAcceso(); */

				//silencio esta creación de contacto MOMENTÁNEAMENTE: 

				//Creamos el contacto en ZOHO (usando el nuevoAccessToken): 
				/* const datosContactoZoho = await functions.crearContactoApiZoho(nuevoAccessToken, formData, notaPedido); */

				//Definimos los parámetros para Crear el Ticket en ZOHO: 
				/* const newContactId = datosContactoZoho.id; */
				// Consulta para crear el ticket con el id del contacto creado: pasándole el token de acceso y la información del ticket:

				//silencio esta creación de ticket MOMENTÁNEAMENTE: 
				/* const respuestaTicketDeZoho = await functions.crearTicketApiZoho(newContactId, formData, formDataCarrito, precioFinal, notaPedido, nuevoAccessToken); */

				


				/*res.redirect(linkMercadoPagoResponse);
				 return res.status(200).send(linkMercadoPagoResponse); */
				res.status(200).json({ redirectUrl: linkMercadoPagoResponse, external_reference: external_reference }); 

				/* res.status(303).location(linkMercadoPagoResponse).end(); */

			}
			else {
				throw new Error("Fallo en la consulta de mercado pago")
			}

		} catch (error) {
			let retornar = {
				status: 400,
				meta: {
					length: 1,
					msg: error.message
				}
			}
			console.log('este es el error del CATCH: ----->', retornar)
			return res.status(400).json(retornar);
		} finally {
			// Liberar el Mutex en caso de excepción o éxito
			if (release) {
			   release();
			}
		 }
	},
	handleNotification: async (req, res) => {
		let { externalReference } = req.params;
		//declaro el release de mutex
		let release;
		try {
			console.error(' ENTRANDO AL CONTROLADOR >>>>>>HANDLE-NOTIFICATION<<<<< ');
			// Bloquear el acceso al código crítico utilizando el Mutex
			release = await mutex.acquire();


			const notificacionData = req.body;
			console.log('NOTIFICACION DE MERCADO PAGO---->:', notificacionData);
			/* const { externalReference } = req.params; */
			console.log(' 1 Controlador handleNotification llamado con externalReference:', externalReference);

			// SEGÚN COMO LLEGUE LA NOTIFICACIÓN DE MERCADO PAGO ES SI USAMOS MERCHANT ORDER O PAYMENT ORDER. A CONTINUACIÓN SE CHEQUEA CÓMO LLEGA Y SEGÚN ESO SE DEFINE QUÉ FUNCIÓN USAMOS:
			
			//Declaro las variables que se usaran para verificar el status de un método u otro: 
			let statusOfMerchantOrder;
			let statusOfPaymentOrder;

			//IF MERCHANT ORDER O PAYMENT ORDER:  

			// CASO MERCHAND ORDER:
			const { query } = req
			console.log('LA query = req es:', query);
			const topic = query.topic || query.type; if (topic === 'merchant_order') {

				/* Si viene el merchant_order como query se hace lo siguiente: */
				const orderId = query.id;
				console.log('LA orderId que va antes de la función de consultaPagoMerchantOrder:', orderId);

				const merchantResponse = await functions.consultaPagoMerchantOrder(orderId);
				/* console.log('merchantResponse es::', merchantResponse); */
				console.log('status de merchantResponse es:', merchantResponse.status);
				console.log('message de merchantResponse es::', merchantResponse.message);
				/* console.log('orderDetails de message de merchantResponse es::', merchantResponse.orderDetails); */

				statusOfMerchantOrder = merchantResponse ? merchantResponse.status : 'No hay respuesta';
			/* 	statusOfMerchantOrder = merchantResponse.status */
			console.log('estado del statusOfMerchantOrder hasta acá: ', statusOfMerchantOrder);
				//buscando en la base de datos : 
				console.log('empezando el guardado de ORDER ID en la base de datos');
				
				if (!orderId) {
					console.error('OrderId no encontrada Ciclón de mar.esto es handleNotification');
				/* return res.status(404).json({ success: false, error: 'OrderId no encontrada Ciclón de mar.esto es handleNotification' }); */
				}
				try {		

					//-------------->> SI TENEMOS ORDER ID: VAMOS A BUSCAR EN LA BASE DE DATOS PARA VER SI YA ESTÁ CARGADA Y SI TIENE PAYMENT ID.
					//--voy a cargar directamente la order id:

					const carritoExistente = await carritos.findOne({
						where: {  external_reference: externalReference  },
					});
					if (!carritoExistente) {
						console.log('carrito no encontrado en la base de datos. HandleNotification')
						/* return res.status(404).json({ success: false, error: 'Carrito no encontrado' }); */
					}
			
					/* const { mercadoPagoOrderId, mercadoPagoPaymentId } = carritoExistente; */
					const mercadoPagoOrderId = carritoExistente.mercadoPagoOrderId;
					const mercadoPagoPaymentId = carritoExistente.mercadoPagoPaymentId;

					console.log('mercadoPagoOrderId de la base de datos esss:::', mercadoPagoOrderId)
					console.log('mercadoPagoPaymentId de la base de datos esss:::', mercadoPagoPaymentId)

					console.log('orderId:', orderId)
					/* console.log('mercadoPagoOrderId del carrito buscado con OrderId:', mercadoPagoOrderId); */
					/* console.log('mercadoPagoPaymentId del carrito buscado con OrderId:', mercadoPagoPaymentId); */

					//SI LA COLUMNA mercadoPagoOrderId ESTÁ VACÍA VA A SER DIFERENTE DE orderId. Si está vacía actualizamos la base de datos agregando el valor de orderId en la columna mercadoPagoOrderId: 

					await carritos.update(
						{ mercadoPagoOrderId: orderId },
						{ where: { external_reference: externalReference } }
					);
					console.log(' columna de mercadoPagoOrderId cargada con éxito!(cargamos la orderId)');
					
					
				} catch (error) {
					console.error('Error en la carga de columna mercadoPagoOrderId, lo siento perro, a revisar. error:', error);
					
				} 
				/* console.log('la orderId ya está cargada (no es diferente) con lo cual no hacemos nada más. continuamos con el código.') */


				// CASO PAYMENT ORDER:

			} else {
				/* Si viene el paymentId como query se hace lo siguiente: */
				const paymentId = query.id || query['data.id']
				console.log('paymentId es:--->', paymentId);
				let paymentResponse = await functions.consultaPagoPaymentOrder(paymentId);
				

				statusOfPaymentOrder = paymentResponse ? paymentResponse.status : 'No hay respuesta';
				console.log('estado del statusOfPaymentOrder hasta acá: ', statusOfPaymentOrder);
				//guardando en la base de datos : 
				let guardadoPaymentIdresponse = await functions.guardarPaymentId(paymentId, externalReference);
				console.log('guardadoPaymentIdresponse-->>', guardadoPaymentIdresponse);

			} 

			// AHORA se hace todo para recabar información que debe ser enviada al final del controlador. al final con el condicional y estado de statusOfMerchantOrder o statusOfPaymentOrder; se define si creamos o no el ticket de ZOHO----------->>>

			//Se renueva el token:
			const nuevoAccessToken = await functions.renovarTokenDeAcceso();
			
			//Obteniendo datos de compra con externalReference: 
			console.log(' 5 Buscando el registro de formulario Pre compras con el external_reference..')

			//declaro formData por fuera del if y del try para poder acceder a dicha variable luego.
			let formData;
			//declaro precioFinal fuera del if para poder acceder a él luego: 
			let  precioFinal;
			//declaro formDataCarrito fuera del if para poder acceder a él luego: 
			let formDataCarrito;

			try {

				// 1. Buscar el registro con el external_reference
				const carritoExistente = await carritos.findOne({
					where: { external_reference: externalReference },
				});

				if (!carritoExistente) {
					return res.status(404).json({ success: false, error: 'Carrito no encontrado dentro de la lógica para recolectar datos y realizar el ticket de zoho. controlador handlesubmit' });
				}

				// 2. Obtener el FormularioPreComprasId del registro encontrado
				const FormularioPreComprasIdDatos = carritoExistente.FormularioPreComprasId;
				/*  console.log('2. se guardan datos en const FormularioPreComprasIdDatos: ', FormularioPreComprasIdDatos); */

				// 2 BIS  Obtener el CarritosId del registro encontrado:
				const CarritoId = carritoExistente.id;
				/* console.log('2 BIS. se guardan datos en const CarritoId: ', CarritoId); */

				// 3. Buscar el registro con el FormularioPreComprasIdDatos
				const formularioPreComprasDatos = await FormularioPreCompras.findByPk(FormularioPreComprasIdDatos);
				/* console.log('se guardan datos en const FormularioPreComprasIdDatos: ', FormularioPreComprasIdDatos); */
				if (!formularioPreComprasDatos) {
					return res.status(404).json({ success: false, error: 'Registro de FormularioPreCompras no encontrado dentro de la lógica para recolectar datos y realizar el ticket de zoho - Controlador handlesubmit -' });
				}

				// 4. Obtener los datos de formularioPreComprasDatos en la variable formData
				formData = {
					nombreApellido: formularioPreComprasDatos.nombreCompleto,
					email: formularioPreComprasDatos.email,
					celular: formularioPreComprasDatos.celular,
					cp: formularioPreComprasDatos.cp,
					calle: formularioPreComprasDatos.calle,
					notaPedido: formularioPreComprasDatos.notaPedido,
					// Otros campos según sea necesario
				};

				/* console.log('Datos recuperados con éxito: este es el formData-->-->->->->', formData); */


				// 5. Buscar los todos los registros (vinos) con el id de carritoId
				const CompraCarritosDatos = await CompraCarritos.findAll({ where: { carritosId: CarritoId }, });
				/*   console.log('se guardan datos en const CompraCarritosDatos: ', CompraCarritosDatos); */

				if (!CompraCarritosDatos || CompraCarritosDatos.length === 0) {
					return res.status(404).json({ success: false, error: 'Registro de CompraCarritosDatos no encontrado' });
				}

				// 6. Obtener los datos de CompraCarritosDatos y guardarlos en la variable formDataCarrito:
				// Recorremos los elementos del CompraCarritosDatos y crea un registro para cada uno:
				 formDataCarrito = CompraCarritosDatos.map((item) => ({
					compraCarritoId: item.id,
					image: item.image,
					text: item.text,
					price: item.price,
					quantity: item.quantity,
				}));
				/* console.log('se guardan todos los registros en const formDataCarrito: ', formDataCarrito); */

				// Obtenemos el precio total de la compra cartItems utilizando el método map:
				const precioTotal = formDataCarrito.reduce((total, item) => {
					const itemPrice = parseFloat(item.price) * item.quantity;
					return total + itemPrice;
				}, 0);
				 precioFinal = precioTotal.toFixed(2)


			} catch (error) {
				console.error('Error al obtener datos de compra por external_reference:', error);
				throw error;
			}

			if (['paid', 'approved'].includes(statusOfMerchantOrder) || ['paid', 'approved'].includes(statusOfPaymentOrder) ) {

				//buscando en la base de datos: 
				console.log(' 2 empezando la búsqueda en la base de datos con el external reference');
				const carritoExistente = await carritos.findOne({
					where: { external_reference: externalReference }
				});
				if (!carritoExistente) {
					return res.status(404).json({ success: false, error: 'Carrito no encontrado man' });
				}
				// Actualizar el estado de la compra a "PAGADO"
				await carritos.update(
					{ estadoCompra: 'PAGADO' },
					{ where: { external_reference: externalReference } }
				);
				console.log('3 Actualización de columna estado compra actualizada con éxito!');

					//---->>>//// NOTIFICACIÓN POR MAIL  notificamos por mail la confirmación de pago: 
					//si la columna de mail está en 0 (false) recolectamos los datos y le enviamos el mail:
						let email_sent = carritoExistente.email_sent;
					/* 	let emailSuccess  */
				console.log('ESTE ES EL EMAIL_SENT ANTES DE VER SI COMIENZA A MANDAR EL MAIL O NO (LINEA 432):------------------->>>', email_sent);
				/* console.log('ESTE ES EL EMAIL_SUCCESS ANTES DE VER SI COMIENZA A MANDAR EL MAIL O NO (LINEA 433):------------------->>>', emailSuccess); */

				/* if (email_sent === 0  || emailSuccess !== true ) { */
				if (email_sent === 0 ) {
					console.log(' 2 empezando la búsqueda del mail en la base de datos con el external reference');

					/* console.log(' carritoExistente---', carritoExistente); */
					let FormularioPreComprasIdparaBuscar;
					FormularioPreComprasIdparaBuscar = carritoExistente.dataValues.FormularioPreComprasId;

					console.log(' FormularioPreComprasIdparaBuscar!!!xxxxxx>>>>>xxxx>>>', FormularioPreComprasIdparaBuscar);
					const FormularioPreComprasMail = await FormularioPreCompras.findOne({
						where: { id: FormularioPreComprasIdparaBuscar }
					});
					if (!FormularioPreComprasMail) {
						return res.status(404).json({ success: false, error: 'FormularioPreCompras no encontrado man' });
					}

					let correoDestino = FormularioPreComprasMail.email;
					console.log('correoDestino es este:-->-->->->->->->', correoDestino)
					const asunto = 'Confirmación de compra Galperín Cósmico';
					const contenido = 'La compra ha sido confirmada PRINCIPE DE VELER';

					const confirmacionMail = await functions.enviarCorreo(correoDestino, asunto, contenido);
					console.log('confirmacionMail! es la siguiente: --->', confirmacionMail);
					
					 let emailSuccess = confirmacionMail.success;

					console.log('emailSucces! es el siguiente: --->', emailSuccess);
					//agregando cambios 02.01.24 para solucionar el IF 
					if (emailSuccess === true){
						const respuestaActualizarColumnaEmailSent = await functions.actualizarColumnaEmailSent(externalReference)
						const actualizarColumnaSuccessState = respuestaActualizarColumnaEmailSent.success;
						if(actualizarColumnaSuccessState === true){
							console.log('actualizarColumnaSuccessState es igual a SUCCESS TRUE --->', actualizarColumnaSuccessState)
						} else {
							console.log('quepaso es igual a SUCCESS FALSE --->', actualizarColumnaSuccessState)
						}
					}

				}
				else{
				console.log('El correo ya ha sido enviado');
				}

				let ticket_created = carritoExistente.ticket_created;
					console.log('ESTE ES EL TICKET_CREATED:------------------->>>', ticket_created);

				/* let ticketSuccess;
				console.log('ESTE ES EL TICKET_SUCCESS:------------------->>>', ticketSuccess) */

				if (ticket_created === 0  /* || ticketSuccess !== true */) {
					//7. Creamos el contacto en ZOHO (usando el nuevoAccessToken):   
					const datosContactoZoho = await functions.crearContactoApiZoho(nuevoAccessToken, formData);

					//8. Definimos los parámetros para Crear el Ticket en ZOHO: 
					const newContactId = datosContactoZoho.id;

					/* 	console.log('se guardan datos en const newContactId: ', newContactId); */
					// 9. Creamos el ticket y guardamos el número de ticket de zoho:
					const respuestaTicketDeZoho = await functions.crearTicketApiZoho(newContactId, formData, formDataCarrito, precioFinal, /*  notaPedido, */ nuevoAccessToken);
					
					let ticketSuccess = respuestaTicketDeZoho.success;
					console.log('El valor de success de ticket Success antes del if es:', ticketSuccess);
					/* let ticketSuccess = respuestaTicketDeZoho.success !== undefined ? respuestaTicketDeZoho.success : false; */
					/* if (ticketSuccess !== true) {
						console.log('El valor de success de ticket Success es:', ticketSuccess);
					  } else {
						console.log('La propiedad success de ticket Success es undefined en la respuesta.');
						ticketSuccess = false;
					  } */
					if(ticketSuccess === true){
						/* try {
						await carritos.update(
							{ ticket_created: true },
							{ where: { external_reference: externalReference } } );
						
							console.log('Actualización de columna ticket_created actualizada con éxito!');	

						} catch (error) {
							console.error('Error en la Actualización de columna ticket_created, revisar. Error:', error);
							return { success: false, error: error.message };
						  } */

						const respuestaActualizarColumnaCreatedTicket = await functions.actualizarColumnaCreatedTicket(externalReference)
						console.log(' Respuesta ActualizarColumnaCreatedTicket:-->>> ', respuestaActualizarColumnaCreatedTicket);

					}
					else {
									
						console.log('No se actualizó la columna Created Ticket (linea523)');
					};
									// Manejar el resultado según sea necesario
								/* 	if (respuestaActualizarColumnaCreatedTicket.success) {
									
										console.log(resultadoActualizacion.message);
									} else {
									
										console.error(resultadoActualizacion.error || resultadoActualizacion.message);
									}; */
					//-------------------------------------------------------------------------------------------//

					//CREAR FUNCIÓN PARA ACTUALIZAR COLUMNA DE TICKET CREATED Y DE MAIL ENVIADO PARA USAR COMO CONDICIONAL!!


					let ticketNumberZoho = respuestaTicketDeZoho.ticketNumber;
					console.log('se CREA ticketNumberZoho: ', ticketNumberZoho);
					console.log('el tipo de dato guardado en ticketNumberZoho es: ', typeof ticketNumberZoho)

					// 10.Guardamos el número del ticket Zoho en la base de datos:

					console.log('externalReference es--->: ', externalReference)
					let pasandoExternalReference = externalReference;
					const guardadoZohoTicketRespuesta = await functions.guardarZohoTicket(res, ticketNumberZoho, pasandoExternalReference);
					
				}
				else {
					console.log('el ticket ya ha sido creado');
				}

			} else {
				console.log('$$$$$$$$ COMPRA no PAGADA CAPOMAN, LA MEJOR IGUAL CUANDO NOS LLEGUE EL PAGO TE AVISAMOS $$$$$$$$$$$->>');
				res.status(200).json({
					success: true,
					message: 'Por ahora sos un gato barato',
					formData,
					precioFinal,
					formDataCarrito,
					mensajeEstadoCompra: 'Pago aun no confirmado ratapaloma',
				});
			} 

		} catch (error) {

			console.error('Error en el controlador de handlenotification: ', error);
			res.status(500).json({ success: false, error: error.message });
		}
		finally {
			// Liberar el Mutex en caso de excepción o éxito
			if (release) {
				release();
			}
		}
	},
	
	handleStatusRequest: async (req, res) => {
		console.log('ENTRANDO AL CONTROLADOR >>>>>>HANDLE-STATUS-REQUEST<<<<< ');
		const { externalReference } = req.params;
		console.log('1 externalReference:', externalReference);
		let formDataCarrito;
		try {
			console.log('2 empezando la búsqueda en la base de datos con el external reference');
	
			const carritoExistente = await carritos.findOne({
				where: { external_reference: externalReference },
			});
			
			if (!carritoExistente) {
				return res.status(404).json({ success: false, error: 'Carrito no encontrado' });
			}
	
			const { estadoCompra, FormularioPreComprasId } = carritoExistente;
	
			const formularioPreComprasDatos = await FormularioPreCompras.findByPk(FormularioPreComprasId);
			
			if (!formularioPreComprasDatos) {
				return res.status(404).json({ success: false, error: 'Registro de FormularioPreCompras no encontrado' });
			}
	
			const formData = {
				nombreApellido: formularioPreComprasDatos.nombreCompleto,
				email: formularioPreComprasDatos.email,
				celular: formularioPreComprasDatos.celular,
				cp: formularioPreComprasDatos.cp,
				calle: formularioPreComprasDatos.calle,
			};
	
			const CarritoId = carritoExistente.id;
			const CompraCarritosDatos = await CompraCarritos.findAll({ where: { carritosId: CarritoId } });
			
			if (!CompraCarritosDatos || CompraCarritosDatos.length === 0) {
				return res.status(404).json({ success: false, error: 'Registro de CompraCarritosDatos no encontrado' });
			}
	
			 formDataCarrito = CompraCarritosDatos.map((item) => ({
				compraCarritoId: item.id,
				image: item.image,
				text: item.text,
				price: item.price,
				quantity: item.quantity,
			}));
	
			const precioTotal = formDataCarrito.reduce((total, item) => {
				const itemPrice = parseFloat(item.price) * item.quantity;
				return total + itemPrice;
			}, 0);
	
			const precioFinal = precioTotal.toFixed(3);
			console.log('precioFinal de la línea 443(controlador handleStatusRequest):', precioFinal);
			
			// Enviar una respuesta al frontend con todos los datos obtenidos:
			if (estadoCompra === 'NO PAGADO') {
				console.log('$$$$$$$$ COMPRA NO PAGADA MASTER LE TENEMOS QUE AVISAR QUE CUANDO NOS LLEGUE SE LO VAMOS A NOTIFICAR $$$$$$$$$$$->>');
				res.status(200).json({
					success: true,
					message: 'Datos consultados con éxito!',
					formData,
					precioFinal,
					formDataCarrito,
					mensajeEstadoCompra: 'Pendiente de confirmación. Cuando recibamos la confirmación de pago le enviaremos el comprobante al email.',
				});
			} else {
				console.log('$$$$$$$$ COMPRA PAGADA CAPO, CRACK, BILLETERA DE ELON MASK TE AVISAMOS QUE TODO JOYA $$$$$$$$$$$->>');
				res.status(200).json({
					success: true,
					message: 'Datos consultados con éxito!',
					formData,
					precioFinal,
					formDataCarrito,
					mensajeEstadoCompra: 'Pago confirmado con éxito.',
				});
			}
		} catch (error) {
			console.error('Error en el controlador handleStatusRequest:', error);
			res.status(500).json({ success: false, error: error.message });
		}
	}
	
	
		 
	
}

export default controller;


/* handleStatusRequest: async (req, res) => {

		console.log(' ENTRANDO AL CONTROLADOR >>>>>>HANDLE-STATUS-REQUEST<<<<< ');
		const { externalReference } = req.params;
		console.log(' 1  externalReference:', externalReference);
		
		try {
			console.log(' 2 empezando la búsqueda en la base de datos con el external reference');
			
			// 1. Buscar el registro con el external_reference
			const carritoExistente = await carritos.findOne({
				where: { external_reference: externalReference },
			});

			if (!carritoExistente) {
				return res.status(404).json({ success: false, error: 'Carrito no encontrado' });
			}
			console.log(' 4 este es el carritoExistente------------------------------------------->>: ', carritoExistente);
			const estadoCompra = carritoExistente.estadoCompra;
			console.log(' 3 este es el estadoCompra--$$$$$$$$$$$$$$$$$$$->>', estadoCompra);
			
			
			// 2. Obtener el FormularioPreComprasId del registro encontrado
			const FormularioPreComprasIdDatos = carritoExistente.FormularioPreComprasId;
			console.log('2. se guardan datos en const FormularioPreComprasIdDatos: ', FormularioPreComprasIdDatos);
			
			// 2 BIS  Obtener el CarritosId del registro encontrado:
			const CarritoId = carritoExistente.id;
			console.log('2 BIS. se guardan datos en const CarritoId: ', CarritoId);
			
			// 3. Buscar el registro con el FormularioPreComprasIdDatos
			const formularioPreComprasDatos = await FormularioPreCompras.findByPk(FormularioPreComprasIdDatos);
			console.log('se guardan datos en const FormularioPreComprasIdDatos: ', FormularioPreComprasIdDatos);
			if (!formularioPreComprasDatos) {
				return res.status(404).json({ success: false, error: 'Registro de FormularioPreCompras no encontrado' });
			}

			// 4. Obtener los datos de formularioPreComprasDatos en la variable formData
			const formData = {
				nombreApellido: formularioPreComprasDatos.nombreCompleto,
				email: formularioPreComprasDatos.email,
				celular: formularioPreComprasDatos.celular,
				cp: formularioPreComprasDatos.cp,
				calle: formularioPreComprasDatos.calle,
			};

			console.log('Datos recuperados con éxito: este es el formData-->-->->->->', formData);


			// 5. Buscar los todos los registros (vinos) con el id de carritoId
			const CompraCarritosDatos = await CompraCarritos.findAll({ where: { carritosId: CarritoId }, });
			console.log('se guardan datos en const CompraCarritosDatos: ', CompraCarritosDatos);

			if (!CompraCarritosDatos || CompraCarritosDatos.length === 0) {
				return res.status(404).json({ success: false, error: 'Registro de CompraCarritosDatos no encontrado' });
			}
			
			// 6. Obtener los datos de CompraCarritosDatos y guardarlos en la variable formDataCarrito:
			// Recorremos los elementos del CompraCarritosDatos y crea un registro para cada uno:
			const formDataCarrito = CompraCarritosDatos.map((item) => ({
				compraCarritoId: item.id,
				image: item.image,
				text: item.text,
				price: item.price,
				quantity: item.quantity,
			}));
			console.log('se guardan todos los registros en const formDataCarrito: ', formDataCarrito);

			// Obtenemos el precio total de la compra cartItems utilizando el método map:
			const precioTotal = formDataCarrito.reduce((total, item) => {
				const itemPrice = parseFloat(item.price) * item.quantity;
				return total + itemPrice;
			}, 0);
			const precioFinal = precioTotal.toFixed(3)
			console.log('precioFinal de la línea 443(controlador handleStatusRequest ):', precioFinal);
			
		  // Enviar una respuesta al frontend con todos los datos obtenidos:
		  
		  if (estadoCompra === 'NO PAGADO') {
			  
				console.log(' $$$$$$$$ COMPRA NO PAGADA MASTER LE TENEMOS QUE AVISAR QUE CUANDO NOS LLEGUE SE LO VAMOS A NOTIFICAR $$$$$$$$$$$->>');
				
				res.status(200).json({
					success: true,
					message: 'Datos consultados con éxito!',
					formData: formData,
					precioFinal: precioFinal,
					formDataCarrito: formDataCarrito,
					mensajeEstadoCompra: 'Pendiente de confirmación. Cuando recibamos la confirmación de pago le enviaremos el comprobante al Mail.'
				});
			}  else {
				
				console.log(' $$$$$$$$ COMPRA PAGADA CAPO, CRACK, BILLETERA DE ELON MASK TE AVISAMOS QUE TODO JOYA $$$$$$$$$$$->>');
				res.status(200).json({
					success: true,
					message: 'Datos consultados con éxito!',
					formData: formData,
					precioFinal: precioFinal,
					formDataCarrito: formDataCarrito,
					mensajeEstadoCompra: 'Pago confirmado con éxito.'
				});
			} catch (error) {
				console.error('Error en el controlador handleStatusRequest final capo:', error);
				res.status(500).json({ success: false, error: error.message });
			}
			} 
		}, */



//SEGUNDO FRANCIA: acá hacer la solicitud a la base de datos con el externalReference para recopilar los datos necesarios para ZOHO. ( O intentar hacer todo desde el controlador submitCarritoCompras )

	 //ZOHO---------------------------------------------------------->>>
	 
				//silencio esta renovación de ticket MOMENTÁNEAMENTE: 
				//Se renueva el token:
				/* const nuevoAccessToken = await functions.renovarTokenDeAcceso(); */
				
				//silencio esta creación de contacto MOMENTÁNEAMENTE: 
				
				//Creamos el contacto en ZOHO (usando el nuevoAccessToken): ACÁ VAS A TENER QUE TRAER DE LA BASE DE DATOS EL FORM DATA Y NOTA PEDIDO:  
				// const datosContactoZoho = await functions.crearContactoApiZoho(nuevoAccessToken, formData, notaPedido); 

				//Definimos los parámetros para Crear el Ticket en ZOHO: 
				/* const newContactId = datosContactoZoho.id; */
				// Consulta para crear el ticket con el id del contacto creado: pasándole el token de acceso y la información del ticket:

				//silencio esta creación de ticket MOMENTÁNEAMENTE: 
				/* const respuestaTicketDeZoho = await functions.crearTicketApiZoho(newContactId, formData, formDataCarrito, precioFinal, notaPedido, nuevoAccessToken); */
	  
				// Ejemplo:
	/*   const zohoResponse = await zohoCRM.createTicket(req.body); */
	  
	  // Puedes devolver una respuesta al cliente o simplemente enviar una respuesta 200 OK.




	  
				// 11.Envío los datos a https://www.antoniomaswines.createch.com.ar/success para construir la vista del ticket:
				//forma 1
				//forma 2:
				/* 	try {
					const formDataString = encodeURIComponent(JSON.stringify(formData));
					const formDataCarritoString = encodeURIComponent(JSON.stringify(formDataCarrito));
					const precioFinalString = encodeURIComponent(JSON.stringify(precioFinal));
					
					const redirectTo = `https://www.antoniomaswines.createch.com.ar/success/${externalReference}?formData=${formDataString}&formDataCarrito=${formDataCarritoString}&precioFinal=${precioFinalString}`;
					res.redirect(302, redirectTo);
					}catch (error) {
						console.error('Error en la redirección a la página del frontend:', error);
						res.status(500).json({ success: false, error: error.message })
					} */
				
				//forma 3
				/* const redirectTo = `https://www.antoniomaswines.createch.com.ar/success/${externalReference}`;
				res.redirect(302, redirectTo); */