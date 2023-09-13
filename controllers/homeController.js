import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
//import db from "../database/config/db.js"; 
import Usuario from '../database/models/Usuario.js';
import FormularioPreCompras from '../database/models/formularioPreCompras.js';
import { response } from 'express';
import functions from '../functions/utils/functions.js'

// INICIO DEL MÓDULO: 

const controller = {
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
		try {

			//Consulta a Mobex para realizar el pago:
			const consulta = await functions.consultaMobex();

			//Recepción de datos desde el frontEnd: Se dividen en 2 Grupos:
			let formData = req.body.paymentFormData; //Datos del formulario del usuario (nombre apellido, email, celular, cp, calle, numero, manzana, barrio, localidad).

			let formDataCarrito = req.body.cartArray;// Datos del carrito (vinos,cantidades, precio de cada unidad, imagen, nota del pedido).

			// Obtenemos el total de la compra cartItems utilizando el método map:
			const precioTotal = formDataCarrito.reduce((total, item) => {
				const itemPrice = parseFloat(item.price) * item.quantity;
				return total + itemPrice;
			}, 0);
			// Obtenemos la nota redactada en el carrito de compras: Podemos hacerlo de 2 maneras: 
			/* let notasPedidos = [];
			formDataCarrito.forEach(item => {
			  notasPedidos.push(item.notaPedido);
			}); */
			let notaPedido = formDataCarrito[0].notaPedido;
			console.log('ESTE ES EL notaPedido:--->', notaPedido);
			
			// Si la respuesta de MOBEX es favorable guardamos los datos y creamos el ticket en Zoho: 
			
			if (consulta.status === 200) {
	
				// Crear registro con los datos del usuario en la tabla FormularioPreCompras:
				const formularioPreComprasDataResponse = await functions.handleFormularioPreCompras2(formData);

				// Obtener el ID del FormularioPreCompras: 
				const FormularioPreComprasId = await formularioPreComprasDataResponse.id;
				// Obtener la fechaCompra del FormularioPreCompras: 
				const fechaCompra = await formularioPreComprasDataResponse.createdAt;
				
				// Crear registro en tabla Carritos: 
				const llenarCarritoDataResponse = await functions.llenarCarritos(FormularioPreComprasId, fechaCompra, precioTotal);

				// Obtener el ID del registro creado en la tabla Carritos(contiene un resumen de la compra):
				const carritoId = await llenarCarritoDataResponse.id;
				
				// Crear registro de productos en la tabla CompraCarritos (contiene el detalle de la compra):
				const compraCarritosDataResponse = await functions.compraCarritos2(formDataCarrito, carritoId);
				
				console.log('este es el precioTotal: ---->', precioTotal.toFixed(2))
				

				//ZOHO---------------------------------------------------------->>>
				
				//Se renueva el token:
				const nuevoAccessToken = await functions.renovarTokenDeAcceso();

				//Creamos el contacto en ZOHO (usando el nuevoAccessToken): 
				const datosContactoZoho = await functions.crearContactoApiZoho(nuevoAccessToken, formData, notaPedido);
				
				//Definimos los parámetros para Crear el Ticket en ZOHO: 
				const newContactId = datosContactoZoho.id;
				// Consulta para crear el ticket con el id del contacto creado: pasándole el token de acceso y la información del ticket:
				const respuestaTicketDeZoho = await functions.crearTicketApiZoho(newContactId, formData, notaPedido, nuevoAccessToken);

				return res.status(200).send(consulta.data);
			}
			else {
				throw new Error("Fallo en la consulta de mobexx")
			}

		} catch (error) {
			let retornar = {
				status: 400,
				meta: {
					length: 1,
					msg: error.message
				}
			}
			console.log('este es el error del CATCH: ----->' , retornar)
			return res.status(400).json(retornar);
		};
	}
}

export default controller;