var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Opciones por defecto de fileUpload
app.use(fileUpload());

app.put('/:tipo/:id',(req,res,next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos válidos
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if (tiposValidos.indexOf( tipo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida.',
            errors: {message: 'Tipo de colección no válida.' }         
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe de seleccionar una imagen.',
            errors: {message: 'Debe de seleccionar una imagen.' }         
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var ext = nombreCortado[nombreCortado.length - 1];

    // Extensiones aceptadas
    var validExt = ['png', 'jpg', 'gif', 'jpeg'];
    if (validExt.indexOf( ext ) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {message: 'Las extensiones válidas son ' + validExt.join(', ') }         
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ ext }`;

    //Mover el archivo del path temporal a una determinado
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    
    archivo.mv( path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
    });
    subirPorTipo ( tipo, id, nombreArchivo, res );
});

function subirPorTipo ( tipo, id, nombreArchivo, res ) {
    if (tipo ==='usuarios') {
        Usuario.findById( id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'El usuario no existe',
                    errors: { message: 'El usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'No se pudo actualizar el usuario',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada.',
                    usuario: usuarioActualizado
                });

            });
        });
    }
    if (tipo ==='medicos') {
        Medico.findById( id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'El médico no existe',
                    errors: { message: 'El medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'No se pudo actualizar el médico',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada.',
                    medico: medicoActualizado
                });

            });
        });
    }
    if (tipo ==='hospitales') {
        Hospital.findById( id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'El hospital no existe',
                    errors: { message: 'El hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'No se pudo actualizar el hospital',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada.',
                    hospital: hospitalActualizado
                });

            });
        });
    }
}

module.exports = app;