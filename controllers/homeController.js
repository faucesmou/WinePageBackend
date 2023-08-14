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
      // Aquí puedes acceder a los datos enviados por el formulario
      const formData = req.body;
    
      // Aquí podemos aplicar cualquier lógica necesaria
      // Y luego enviamos una respuesta
      res.json({ message: 'Formulario recibido con éxito desde el controller de BackEnd, este es el formData: ', formData });
    },
    submitEmailFooter:(req, res) => {
      // Aquí puedes acceder a los datos enviados por el footer
      const formData3 = req.body;
    
      // Aquí podemos aplicar cualquier lógica necesaria
      // Y luego enviamos una respuesta
      res.json({ message: 'Email recibido con éxito el cart State desde el controller de BackEnd, este es el formData: ', formData3 });
    },
    submitCarritoCompras: async(req, res) => {
      try {
	  const urlCheckoutMobbex = "https://api.mobbex.com/p/checkout";
	  let config = {
		headers: {
			"x-api-key" : 'F61UV8kikz7Hw0fa5zmO5M0iTeb~c5ycIWl_qmIq',
			"x-access-token": 'a188450f-f26c-4577-85fe-eb8dabb87cd5',
			"content-type": "application/json",
		}
	  	}
	  const data = JSON.stringify({
		total: 700,
		description: "prueba de MOBEX! ",
		currency: "ARS",
		reference: "12345678",
		test: true,
		return_url: "Url a la que será enviado el usuario al finalizar el pago", // esto con amplify sino en local no 
		webhook: "http://localhost:5173/tiendaOnline/mobbex/webhook", // ver si responde por req.body. req.header. o req.query. req.params esta dirección es opcional y es es la URL a la cual será infomrado el pago mediante webhooks (POST)-----------------------------><
		//listado de elementos para el cobro con el checkout y que serán mostrados al ingresar al mismo como parte de la descripción de pago. Para generar un checkout asociado a una suscripción  se debe configurar en este array. Ver el ejemplo sobre este nodo incluido debajo de esta documentación.
		item: [{
			image:"http://www.mobbex.com/wp-content/uploads/2019/03web_logo.png",
			quantity: 2,
			description: "Mi producto",
			total: 250
		}, ],
		//Permite la limitación de los medios de pago aceptados. De esta forma, en el checkout únicamente podrán utilizarse los medios de pago aquí definidos. 
		sources: ["visa", "mastercard"],
		//Permite la limitación de los planes activos al pagar la orden. Para realizar dicha limitación se debe enviar un arrayt de referncias de planes. Los ejemplos se pueden encontrar más abajo en la documentaci´no. 
		installments: [],
		//objeto con los datos del cliente
		customer: {
			email: "cristian.elias@andessalud.ar",
			identification: "12123123",
			name: "Cristian Elias"
		},
		//Tiempo de vida en minutos del checkout durante el cual podrá ser utilizado, luego de este tiempo el checkout no tendrá validez. Por defecto son 60 minutos
		timeout: 3
	  });
	  let consulta = await axios.post(urlCheckoutMobbex, data, config) //consulta es el "response" de la petición. 
	  
	  console.log(consulta.data)
	  
	  return res.status(200).json(consulta.data)
		} catch (error) {
		console.error('este es el error del submitCarritoDeCompras: ', error);
		return res.status(500).json({error: 'Error en la solicitud a Mobbex'});
		};
	}
  };
  
  export default controller;
  
  /*  res.json({ message: 'Carrito de compras recibido con éxito desde el controller de BackEnd, este es el cartState guardado en formData4: ', formData4 }); */


/*   const formData4 = req.body;
      const checkoutData = {
        total: formData4.total,
        currency: 'ARS',
        // ... otros datos necesarios para la intención de cobro
      };
      const intent = await mobbex.checkout.create(checkoutData);
      // Devuelve la URL de Mobbex para redirigir al cliente
      res.json({ url: intent.url }); //acá debería reemplazar intent.url por https://api.mobbex.com/p/checkout ?
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear intención de cobro' });
    }
    } */