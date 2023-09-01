import { Router } from 'express';
import controller  from '../controllers/homeController.js';

let router = Router();

router.post('/submit-form', controller.registrarUsuario)
router.post('/submit-emailfooter', controller.submitEmailFooter)
router.post('/submit-carritoCompras', controller.submitCarritoCompras)

/* router.get('/', controller.getLanding) */
/* router.post('/pruebaCris', controller.pruebaCris) */
/* router.post('/reciboMobex', controller.reciboMobex) */

export default router;
