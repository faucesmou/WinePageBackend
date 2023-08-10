import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    submitCarritoCompras:(req, res) => {
      // Aquí puedes acceder a los datos enviados por el carrito de Compras
      const formData4 = req.body;
    
      // Aquí podemos aplicar cualquier lógica necesaria
      // Y luego enviamos una respuesta
      res.json({ message: 'Carrito de compras recibido con éxito desde el controller de BackEnd, este es el cartState guardado en formData4: ', formData4 });
    },

};

export default controller;
