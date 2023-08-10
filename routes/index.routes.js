import { Router } from 'express';
import controller  from '../controllers/homeController.js';

let router = Router();

/* router.get('/', controller.getLanding) */
router.post('/submit-form', controller.submitForm)
router.post('/submit-emailfooter', controller.submitEmailFooter)
router.post('/submit-carritoCompras', controller.submitCarritoCompras)
export default router;



/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.send('La conexión desde routes funciona man');
}); */