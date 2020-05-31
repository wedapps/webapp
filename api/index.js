'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

// conexiòn a DataBase
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/project3', {useMongoClient: true})
        .then(() => {
            console.log("Hola Wedapp, ¡la conexión a la base de datos project3 se ha realizado correctamente!");

            // crear servidor
            app.listen(port, () => {
                console.log("Servidor corriendo en http://localhost:3800");
            });
        })
        .catch(err => console.log(err));