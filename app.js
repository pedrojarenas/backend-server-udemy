//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login')

//Inicializar variables
var app = express();

//BodyParser application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', 
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, 
    ( err,res ) => {
        if (err) { throw err;  }
});

//Rutas
 


//Middlewares
app.use('/usuario',usuarioRoutes); 
app.use('/login',loginRoutes); 
app.use('/',appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server en el puerto 3000: \x1b[32m%s\x1b[0m', 'online.');
});