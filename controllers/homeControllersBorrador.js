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

//Esta función es para resolver la separación de miles: recibe un número y lo devuelve en el formato requerido "1.000.000": 

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controllerBorrador = {
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
	pruebaCris: async (req, res) => {
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

			const response = await axios.post(urlCheckoutMobbex, { id }, { config })
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
	submitCarritoComprasORIGINAL: async (req, res) => {
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
	
	/* const authorizationCode = '1000.b69c9d07aab278e335b43bc529ef9684.327a9c48e92d42b66205d5815ef54089'; */
				// Solicitud de Token de acceso OAuth de Zoho:
				/* const accessTokenInfo = await functions.cambioCodigoPorToken(authorizationCode);
				console.log('este es el accessTokenInfo!!!:------>', accessTokenInfo );
				console.log("token de acceso obtenido! -->", accessTokenInfo.accessToken); */

				/* const refreshToken = accessTokenInfo.refreshToken; */
				// Antes de realizar llamadas a la API, verifica la vigencia del token y renueva si es necesario.

				/* const expirationTimestamp = Date.now() + (accessTokenInfo.expires_in * 1000); */ // Multiplica por 1000 para convertir segundos en milisegundos
				
	if (expirationTimestamp <= Date.now()) {
		// El token de acceso ha expirado, necesitas renovarlo:
		const nuevoAccessToken = await functions.renovarTokenDeAcceso(refreshToken);
		/* console.log("Token de acceso renovado! -->", nuevoAccessToken); */
		// Utiliza nuevoAccessToken para tus llamadas a la API
	
	// URL de la API de Zoho Desk
	const apiUrl = 'https://desk.zoho.com/api/v1/tickets/1892000000143237';

	// Consulta a API:
	try {
		const respuestaZoho = await functions.consultarApiZoho(apiUrl, nuevoAccessToken);
		/* console.log(respuestaZoho); */
		return res.status(200).json(respuestaZoho);
	} catch (error) {
		/* console.error('error al llamar a la API de Zoho Desk:', error.message); */
		return res.status(500).json({ error: 'Error en la consulta a Zoho Desk' });
	}
} else {
  };
  
  export default controllerBorrador;


  // borrador del 23/11/23

  /* submitCarritoCompras: async (req, res) => {
		try {

			//silencio esta Consulta a Mobex MOMENTÁNEAMENTE: 
			//Consulta a Mobex para realizar el pago:
			/* const consulta = await functions.consultaMobex(); */

			//Recepción de datos desde el frontEnd: Se dividen en 2 Grupos:
			let formData = req.body.paymentFormData; //Datos del formulario del usuario (nombre apellido, email, celular, cp, calle, numero, manzana, barrio, localidad).

			let formDataCarrito = req.body.cartArray;// Datos del carrito (vinos,cantidades, precio de cada unidad, imagen, nota del pedido).
			console.log('formDataCarrito', formDataCarrito);
			// Obtenemos el precio total de la compra cartItems utilizando el método map:
			const precioTotal = formDataCarrito.reduce((total, item) => {
				const itemPrice = parseFloat(item.price) * item.quantity;
				return total + itemPrice;
			}, 0);
			const precioFinal = precioTotal.toFixed(3)
			
			// Obtenemos la nota redactada en el carrito de compras: Podemos hacerlo de 2 maneras: 
			/* let notasPedidos = [];
			formDataCarrito.forEach(item => {
			  notasPedidos.push(item.notaPedido);
			}); */
			let notaPedido = formDataCarrito[0].notaPedido;
			
			// Si la respuesta de MOBEX es favorable guardamos los datos y creamos el ticket en Zoho: 
			
			if (consulta.status === 200) {
					
				// Crear registro con los datos del usuario en la tabla FormularioPreCompras:
				const formularioPreComprasDataResponse = await functions.handleFormularioPreCompras2(formData);

				// Obtener el ID del FormularioPreCompras: 
				const FormularioPreComprasId = await formularioPreComprasDataResponse.id;
				// Obtener la fechaCompra del FormularioPreCompras: 
				const fechaCompra = await formularioPreComprasDataResponse.createdAt;
				
				// Crear registro en tabla Carritos: 
				const llenarCarritoDataResponse = await functions.llenarCarritos(FormularioPreComprasId, fechaCompra, precioFinal);

				// Obtener el ID del registro creado en la tabla Carritos(contiene un resumen de la compra):
				const carritoId = await llenarCarritoDataResponse.id;
				
				// Crear registro de productos en la tabla CompraCarritos (contiene el detalle de la compra):
				const compraCarritosDataResponse = await functions.compraCarritos2(formDataCarrito, carritoId);
				
				//MERCADO-PAGO---------------------------------------------------------->>> */


				submitCarritoCompras: async (req, res) => {
					try {
			
						//Recepción de datos desde el frontEnd: Se dividen en 2 Grupos:
						let formData = req.body.paymentFormData; //Datos del formulario del usuario (nombre apellido, email, celular, cp, calle, numero, manzana, barrio, localidad).
			
						let formDataCarrito = req.body.cartArray;// Datos del carrito (vinos,cantidades, precio de cada unidad, imagen, nota del pedido).
						console.log('formDataCarrito', formDataCarrito);
								const precioTotal = formDataCarrito.reduce((total, item) => {
							const itemPrice = parseFloat(item.price) * item.quantity;
							return total + itemPrice;
						}, 0);
						const precioFinal = precioTotal.toFixed(3)
						
					
						let notaPedido = formDataCarrito[0].notaPedido;
		
						const formularioPreComprasDataResponse = await functions.handleFormularioPreCompras2(formData);
			
						
						const FormularioPreComprasId = await formularioPreComprasDataResponse.id;
						
						const fechaCompra = await formularioPreComprasDataResponse.createdAt;
			
						const llenarCarritoDataResponse = await functions.llenarCarritos(FormularioPreComprasId, fechaCompra, precioFinal);
			
						
						const carritoId = await llenarCarritoDataResponse.id;
			
						
						const compraCarritosDataResponse = await functions.compraCarritos2(formDataCarrito, carritoId);
			
						const linkMercadoPagoResponse = await functions.crearLinkMercadoPago(/* FormularioPreComprasId,mes,precioFinal */);
						
						if (linkMercadoPagoResponse.status === 200) {
							
						console.log("Este es el linkMercadoPagoResponse: -->" , linkMercadoPagoResponse); 
				

							
							const fechaObj = new Date(fechaCompra);
			
					
							const año = fechaObj.getFullYear();
							const mes = fechaObj.getMonth() + 1; // Sumar 1 porque los meses en JavaScript van de 0 a 11
							const día = fechaObj.getDate();
							const hora = fechaObj.getHours() - 3;// Restar 3 porque el horario es de argentina
							const minutos = fechaObj.getMinutes();
							const segundos = fechaObj.getSeconds();
			
					
							console.log(`Año: ${año}`); 
			
			
							return res.status(200).send(linkMercadoPagoResponse);
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