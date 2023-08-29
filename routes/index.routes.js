import { Router } from 'express';
import controller  from '../controllers/homeController.js';
/* import Usuario from '../database/models/Usuario.js';  */

let router = Router();

/* router.get('/', controller.getLanding) */
router.post('/submit-form', controller.registrarUsuario)
router.post('/submit-emailfooter', controller.submitEmailFooter)
router.post('/submit-carritoCompras', controller.submitCarritoCompras)
router.post('/pruebaCris', controller.pruebaCris)
/* router.post('/reciboMobex', controller.reciboMobex) */

export default router;



/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.send('La conexión desde routes funciona man');
}); */