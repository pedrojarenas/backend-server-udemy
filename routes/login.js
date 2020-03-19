var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');


var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

var app = express();

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//==========================================================================
// Autenticación por Google OAuth
//==========================================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return  {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {
    var token = req.body.token;
    var googleUser = await verify( token )
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: e
        });
    });
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err) { 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal',
                    errors: err
                });
            }
            else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); 

                res.status(200).json({
                    ok: true,
                    message: 'Login Post correcto.',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            } 
        } else {
            // El usuario no existe y hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email= googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save( (err, usuarioDB) => {
                if (err) { 
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario.',
                        errors: err
                    });
                }
            });            
        }        
    });
    /*res.status(200).json({
        ok: true,
        message: 'Login Post correcto.',
        googleUser: googleUser
    });*/
});

//==========================================================================
// Autenticación normal
//==========================================================================
app.post('/', (req,res) => {
    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioBD) => {
        if (err) { 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcryptjs.compareSync( body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //Crear token
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); 

        res.status(200).json({
            ok: true,
            message: 'Login Post correcto.',
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });    
});

module.exports = app;