import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

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
    submitForm: (req, res) => {
      const formData = req.body;
	  console.log(formData);
      res.json({ message: 'Formulario recibido con éxito desde el controller de BackEnd, este es el formData: ', formData });
    },
    submitEmailFooter:(req, res) => {
      const formData3 = req.body;
      res.json({ message: 'Email recibido con éxito el cart State desde el controller de BackEnd, este es el formData: ', formData3 });
    },
	reciboMobex:(req, res) => {
		const reciboMobex = req.body;
		res.json({ message: 'Recibo de Mobex recibido con éxito el homeController del servidor: ', reciboMobex });
	  },
    submitCarritoCompras: async(req, res) => {
      try {
	  const urlCheckoutMobbex = "https://api.mobbex.com/p/checkout";
	  let config = {
		headers: {
			"x-api-key" : 'F61UV8kikz7Hw0fa5zmO5M0iTeb~c5ycIWl_qmIq',
			"x-access-token": 'a188450f-f26c-4577-85fe-eb8dabb87cd5',
			"content-type": "application/json",
		},
	  	};
		/*  const cartState = req.body; */
		// Obteniendo los datos del cuerpo de la solicitud POST del frontend:
		const cartState = req.body;
		console.log('este es el CARTSTATE obtenido del req.body--->', cartState); 
		
		// Utilizando los datos del carrito para armar la constante data:

		 // Crear la matriz cartItems utilizando el método map
		  const cartItems = cartState.map((item) => ({
			image: "../assets/imgs/s1.png"/* item.image */,
			quantity: item.quantity,
			description: item.text,
			total: parseFloat(item.price) * item.quantity,
		  }));

		  const itemsForMobbex = cartItems.map((item) => ({
			image: item.image,
			quantity: item.quantity,
			description: item.description,
			total: item.total,
		  })); //este itemsForMobbex sigue la línea de la documentación REVISAR

		  const subscriptionItem = {
			type: "subscription",
			reference: "SUBSCRIPTIONUID",
		  }; //este subscriptionItem sigue la línea de la documentación REVISAR

		  const entityItem = { //no toma las imágenes para mostrar en el checkout:
			image: "../assets/imgs/s1.png"/* "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png" */,
			quantity: 5,
			description: "Mi Producto Entity Multivendedor ponele",
			total: 90,
			entity: "demo_uid",
		  }; //este entityItem sigue la línea de la documentación  REVISAR

			const total = cartItems.reduce((acc, item) => acc + item.total, 0); 
			console.log('este es el CART ITEMS configurado para el items del checkout--->', cartItems); 
			console.log('este es el TOTAL-->', total); 
			console.log('este es el TOTAL tofixed--->', total.toFixed(3)); 
			
	  const data = {
		total: total.toFixed(3),
		description: 'Descripción de la compra de vinos realizada en Mobex! 69',
		currency: "ARS",
		reference: "12345678", //Factura, Recibo o referencia del pago a Realizar. Puede ser un identificador de un sistema externo para seguimiento. Este Identificador pertenece a su sistema pero debe ser único para cada operación. Mobbex no permite 2 operaciones en estado Pago con el mismo reference.
		test: true,
		return_url: "Url a la que será enviado el usuario al finalizar el pago" /* "https://google.com.ar" */, //Url a la que será enviado el usuario al finalizar el pago, esto con amplify sino en local no 
		/* webhook: "https://amw.createch.com.ar/api/reciboMobex", */ // ver si responde por req.body. req.header. o req.query. req.params. Esta dirección es opcional y es  la URL a la cual será infomrado el pago mediante webhooks (POST)-----------------------------><
		
		item: [...itemsForMobbex, subscriptionItem, entityItem],/*  cartItems,  */  /* [{
			image:"http://www.mobbex.com/wp-content/uploads/2019/03web_logo.png",
			quantity: 2,
			description: "Mi producto",
			total: 250
		}, ] , */ //listado de elementos para el cobro con el checkout y que serán mostrados al ingresar al mismo como parte de la descripción de pago. Para generar un checkout asociado a una suscripción  se debe configurar en este array.


		sources: ["visa", "mastercard"], //Permite la limitación de los medios de pago aceptados. De esta forma, en el checkout únicamente podrán utilizarse los medios de pago aquí definidos. 
		 
		installments: [], //Permite la limitación de los planes activos al pagar la orden. Para realizar dicha limitación se debe enviar un arrayt de referncias de planes.
		
		customer: { //objeto con los datos del cliente:
			email: "cristian.elias@andessalud.ar", //REQUERIDO
			identification: "12123123", //REQUERIDO
			name: "Cristian Elias",//REQUERIDO
			phone: "string", //opcional
			address: "string",  //opcional
			zipCode: "string: código postal",  //opcional
			country: "string", //opcional
			uid: "string: Identificador del cliente en la Tienda. Debe ser único e irrepetible."  //opcional
		},
		timeout: 3
	  };//Tiempo de vida en minutos del checkout durante el cual podrá ser utilizado, luego de este tiempo el checkout no tendrá validez. Por defecto son 60 minutos.
	  
	  const dataString = JSON.stringify(data); 
	  console.log('llegando a la consulta');
	   let consulta = await axios.post(urlCheckoutMobbex, dataString, config) 
	   //consulta es el "response" de la petición. 
	  
	  return res.status(200).json(consulta.data)
		} catch (error) {
		console.error('este es el error del submitCarritoDeCompras: ', error);
		return res.status(500).json({error: 'Error en la solicitud a Mobbex'});
		};
	}
  };
  
  export default controller;

  //CONTROLADOR PARA CREAR O CARGAR DATOS EN SQL EN PROGRESO: 
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
		mensaje_de_compra: formData.mensaje,
	  });

	  // Si el usuario se crea correctamente, puedes enviar una respuesta de éxito
	  res.json({ message: "Usuario registrado con éxito", usuario: nuevoUsuario });
	} catch (error) {
	  console.error("Error al registrar el usuario:", error);
	  console.log('este es el formData---->' , formData);
	  // Si hay un error, envía una respuesta de error
	  res.status(500).json({ message: "Error al registrar el usuario" });
	}
  }