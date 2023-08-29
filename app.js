import fs from 'fs';
import https from 'https';
import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.routes.js';
import usersRouter from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
//base de datos SQL
import mysql from 'mysql2';
import Sequelize from 'sequelize';
 import db from './database/config/db.js';   // Asegúrate de que esta ruta sea correcta
/* const sequelize = new Sequelize(db);  */
//esto de middlewares revisar:
import dbConnectionTest from './middlewares/dbConnectionTest.js';

//primera parte de backend- frontend:
import cors from 'cors';
import bodyParser from 'body-parser';

// Configuración de certificados SSL
const privateKey = fs.readFileSync('./cert/_.createch.com.ar.key', 'utf8');
const certificate = fs.readFileSync('./cert/_.createch.com.ar.crt', 'utf8');
const ca = fs.readFileSync('./cert/SectigoRSADVBundle.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: ca };

const obtenerFechaYHoraGMT3 = () => {
  // Obtener la fecha y hora actual en el huso horario local
  const fechaHoraActualLocal = new Date();

  // Ajustar la diferencia horaria para obtener la fecha y hora en GMT-3 (Argentina)
  const gmtOffset = -3; // GMT-3: resta 3 horas al tiempo local
  const fechaHoraGMT3 = new Date(fechaHoraActualLocal.getTime() + gmtOffset * 60 * 60 * 1000);

  // Formatear la fecha y hora según tu preferencia
  const fechaFormateada = fechaHoraGMT3.toISOString().slice(0, 10);
  const horaFormateada = fechaHoraGMT3.toISOString().slice(11, 19);

  return {
    fecha: fechaFormateada,
    hora: horaFormateada,
  };
}


//primera parte de Express backend- frontend:
let app = express();
//Configuración de CORS:
app.use(cors());
const allowedOrigins = ['https://www.antoniomaswines.createch.com.ar', 'https://www.antoniomaswines.createch.com.ar/tiendaOnline', 'https://www.antoniomaswines.createch.com.ar/singlevineyard', 'https://www.antoniomaswines.createch.com.ar/beyondthewine', 'https://www.antoniomaswines.createch.com.ar/QuienesSomos','https://www.antoniomaswines.createch.com.ar/NuestrosVinos' ];
app.use(cors({
  origin: allowedOrigins
}));

app.use(bodyParser.json());

// Middleware para el análisis del cuerpo JSON
app.use(express.json());


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

app.use(function (req, res, next) {
  const { fecha, hora } = obtenerFechaYHoraGMT3();
  console.log(`IP: ${req.socket.remoteAddress} Fecha: ${fecha} ${hora}`);
  next();
});

//Configurando middleware para BASE DE DATOS
dbConnectionTest()

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

// Creación del servidor HTTPS
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
  console.log('Servidor corriendo en HTTPS y en puerto 443');
});

/* console.log("escuchando en puerto 80"); */

/* app.listen(port) */