import { Router } from 'express';
import controller  from '../controllers/homeController.js';
// configuración de multer para cargar archivos excel: 
import multer from 'multer';
import path from 'path';
let router = Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ruta donde se almacenarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Nombre del archivo en el servidor
  },
});

const upload = multer({ storage: storage });



router.post('/submit-form', controller.registrarUsuario)
router.post('/submit-emailfooter', controller.submitEmailFooter)
router.post('/submit-carritoCompras', controller.submitCarritoCompras)
router.post('/notification/:externalReference', controller.handleNotification);
router.post('/submit-file', upload.single('archivoExcel'), controller.cargarProductos);
router.get('/statusRequest/:externalReference', controller.handleStatusRequest);
router.get('/productosDisponibles', controller.productosDisponibles);


export default router;

/* Mercado Pago 15/11/23 */
/* router.get('/success', (req, res) => res.send('creating order') ) */
/* router.get('/pending', (req, res) => res.send('pending') )
router.get('/failure', (req, res) => res.send('failure') )
router.get('/create-order', (req, res) => res.send('create-order') )
router.get('/webhook', (req, res) => res.send('webhook') ) */
/* Mercado Pago 15/11/23 */


/* router.get('/', controller.getLanding) */
/* router.post('/pruebaCris', controller.pruebaCris) */
/* router.post('/reciboMobex', controller.reciboMobex) */

