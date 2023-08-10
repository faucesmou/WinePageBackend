import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.routes.js';
import usersRouter from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
//primera parte de backend- frontend:
import cors from 'cors';
import bodyParser from 'body-parser';


//primera parte de backend- frontend:
let app = express();

app.use(cors());
app.use(bodyParser.json());

// Middleware para el análisis del cuerpo JSON
app.use(express.json());

let port = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Seteando motor de vistas
/* app.set('views', path.join(new URL('views', import.meta.url).pathname)); */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

// Configurando middleware para parsear body de requests
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configurando middleware para servir archivos estáticos
app.use(express.static(path.join(new URL('public', import.meta.url).pathname)));

//ROUTES

app.use('/api', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log("escuchando en puerto 80");

app.listen(port)