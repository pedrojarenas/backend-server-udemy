//Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err,res ) => {
    if (err) { throw err;  }
    console.log('Bandera de error');
});

//Rutas
app.get('/',(req,res,next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente.'
    })
})

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server en el puerto 3000: \x1b[32m%s\x1b[0m', 'online.');
});