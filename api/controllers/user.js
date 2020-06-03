'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

// Métodos de Pruebas
function home (req, res) {
    res.status(200).send({
        message: 'Hola Mundo, desde el servidor de NodeJS'
    });
}

function pruebas (req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Acción de pruebas en el servidor de NodeJS'
    });
}

// Registro
function saveUser(req, res) {
    var params = req.body;
    var user = new User();
    if(params.name && params.surname && params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        
        // Controlar usuarios duplicados
        User.find({$or: [
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message: 'Error Usuario'});
            if(users && users.length >= 1) {
                return res.status(200).send({message: '¡Usuario ya registrado!'})
            } else {
                 // cifrado de password y guarda datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if(err) return res.status(500).send({menssage: 'Error al guardar el usuario'});
                        if(userStored) {
                            res.status(200).send({user: userStored});
                        } else {
                            res.status(404).send({menssage: 'No se ha registrado el usuario'});
                        }
                    });
                }); 
            }
        });
    } else {
        res.status(200).send( {
            message: '¡Envía todos los campos necesários!'
        });
    }
}

// método de login
function loginUser(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
        if(err) return res.status(500). send({message: 'Error en la petición'});
        if(user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if(check) {
                    // devolver datos de usuario
                    if(params.gettoken) {
                        // generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // devolver datos de usuario
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                } else {
                    return res.status(404). send({message: '¡Usuario y/o password incorrectos!'});
                }
            });
        } else {
            return res.status(404). send({message: '¡Usuario no registrado! Revise email ingresado e intente nuevamente o regístrese'});
        }
    });
}

// Método para devolver datos de usuarios
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message: 'Error en la petición de usuario'});
        if(!user) return res.status(404).send({message: 'Usuario no existe'});
        return res.status(200).send({user});
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser
}