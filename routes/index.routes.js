import { Router } from 'express';
import { getLanding } from '../controllers/homeController.js';

let router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/landing');
});

router.get('/landing', controller.getLanding)
export default router;

