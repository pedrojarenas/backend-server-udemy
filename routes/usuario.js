var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// ===========================================
// Obtener todos los usuario
// ===========================================
app.get('/',(req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({ }, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(        
        (err, usuarios) => {
        if (err) { 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios.',
                errors: err
            });
        }
        Usuario.count({}, (err, conteo) => {
            if (err) { 
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en conteo de usuarios.',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        });
        
    });
});

// ===========================================
// Actualizar un usuario
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req,res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) { 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios.',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: ' No existe un usuario con ese ID'}
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save( (err,usuarioGuardado) => {
            if (err) { 
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario.',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });    
        });         
    });
});

// ===========================================
// Crear un nuevo usuario
// ===========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body. email,
        password: bcryptjs.hashSync(body.password,10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err,usuarioGuardado) => {
        if (err) { 
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios.',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });    
});

// ===========================================
// Borrar un usuario
// ===========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req,res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) { 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario.',
                errors: err
            });
        }
        if (!usuarioBorrado) { 
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario a borrar.',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;
