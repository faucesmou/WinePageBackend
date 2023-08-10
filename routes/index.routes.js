import { Router } from 'express';
import controller  from '../controllers/homeController.js';

let router = Router();

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.send('La conexión desde routes funciona man');
}); */

router.get('/', controller.getLanding)

export default router;

