// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); 
const createError = require('http-errors');

const usuariosRouter = require('./routes/usuarioRoutes'); 
const loginRoutes = require('./routes/loginRoutes'); 
const datosRoutes = require('./routes/datosRoutes');
const areasRoutes = require('./routes/areasRoutes');
const programasRoutes = require('./routes/programaRoutes')
const authRoutes = require('./routes/authRoutes');
const fotoRoutes = require('./routes/fotoRoutes');
const ishikawa = require('./routes/ishikawaRoutes');


const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const mongo = require('./config/dbconfig');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors()); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Configura las rutas
app.use('/usuarios', usuariosRouter); 
app.use('/', loginRoutes); 
app.use('/datos', datosRoutes);
app.use('/programas', programasRoutes); 
app.use('/areas', areasRoutes);
app.use('/auth', authRoutes);
app.use('/foto', fotoRoutes);
app.use('/ishikawa', ishikawa);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
