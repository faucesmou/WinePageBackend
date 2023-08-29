import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
//import db from "../database/config/db.js"; 
import Usuario from '../database/models/Usuario.js'; 
import FormularioPreCompras from '../database/models/formularioPreCompras.js'; 
import { response } from 'express';

/* import Mobbex from '@mobbex/sdk';


const apiKey = '_8bjoCPu4xW5GCHsp5yDHzSmhMnQU1kfw7nw';
const mobbex = new Mobbex({ apiKey }); */


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	getLanding: (req, res) => {
		/* res.send('la conexión es correcta desde controllers') */

		let landingPageURL = 'https://www.antoniomaswines.createch.com.ar/';
		res.redirect(landingPageURL);
	},
	pruebaCris: async (req,res) => {
		try {
			let id = "CHK:0GDA1DUDIHKC2X45NY"
			const urlCheckoutMobbex = `https://api.mobbex.com/2.0/transactions/status`;
			let config = {
				headers: {
					"content-type": "application/json",
					"x-api-key": "F61UV8kikz7Hw0fa5zmO5M0iTeb~c5ycIWl_qmIq",
					"x-access-token": "a188450f-f26c-4577-85fe-eb8dabb87cd5",
				}
			}

			const response = await axios.post(urlCheckoutMobbex,{id},{config})
			const paymentLinkData = response.data.data;
    
			console.log('DATA --->', response.data);
			console.log('Estado del enlace de pago:', paymentLinkData.status);
			console.log('Monto:', paymentLinkData.amount);
			console.log('Moneda:', paymentLinkData.currency);
			
			console.log("esto es un log");
			return res.status(200).json("Datos recibidos con exito")
		} catch (error) {
			console.log(error);
			return res.status(400).json(error.message)
		}
	},
	submitForm: (req, res) => {
		const formData = req.body;
		console.log('este es el formData recibido en el back---> ', formData);
		res.json({ message: 'Formulario recibido con éxito desde el controller de BackEnd, este es el formData: ', formData });
	},
	submitEmailFooter: (req, res) => {
		const formData3 = req.body;
		res.json({ message: 'Email recibido con éxito el cart State desde el controller de BackEnd, este es el formData: ', formData3 });
	},
	/* reciboMobex:(req, res) => {
		const reciboMobex = req.body;
		res.json({ message: 'Recibo de Mobex recibido con éxito el homeController del servidor: ', reciboMobex });
	  }, */
	submitCarritoCompras: async (req, res) => {
		try {
			const urlCheckoutMobbex = "https://api.mobbex.com/p/checkout";
			let config = {
				headers: {
					"content-type": "application/json",
					"x-api-key": "F61UV8kikz7Hw0fa5zmO5M0iTeb~c5ycIWl_qmIq",
					"x-access-token": "a188450f-f26c-4577-85fe-eb8dabb87cd5",
				}
			}
			// Obteniendo los datos del cuerpo de la solicitud POST del frontend:
			const cartState = req.body
			console.log('este es el CARTSTATE obtenido del req.body del backend--->', cartState)

			// Utilizando los datos del carrito para armar la constante data:
			/* const total = cartItems.reduce((acc, item) => acc + item.total, 0); 
			console.log('este es el CART ITEMS configurado para el items del checkout--->', cartItems); 
			console.log('este es el TOTAL-->', total); 
			console.log('este es el TOTAL tofixed--->', total.toFixed(3));  */

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
			console.log('<-- Llegando a la consulta -->');
			let consulta = await axios.post(urlCheckoutMobbex, dataString, config)
			//consulta es el "response" de la petición. 
			console.log('este es el consulta.data--->', consulta.data.data);
			return res.status(200).json(consulta.data)
		} catch (error) {
			console.error('este es el error del submitCarritoDeCompras: ', error);
			return res.status(500).json({ error: 'Error en la solicitud a Mobbex' });
		};
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
		  console.log('este es el formData---->' , formData);
		  // Si hay un error, envía una respuesta de error
		  res.status(500).json({ message: "Error al registrar el usuario" });
		}
	  }
};

export default controller;