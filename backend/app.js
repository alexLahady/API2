const express = require('express');
//const bodyParser =  require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

//console.log("affiche "+process.env.MONGOOSE);

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

mongoose.connect(process.env.MONGOOSE,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//console.log(bodyParser.json());
//app.use(bodyParser.json());


app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

/*
app.get('/api/sauces', (req, res, next) => {
    const stuff = [
      {
        _id: 'oeihfzeoi',
        name: 'Mon premier objet',
        description: 'Les infos de mon premier objet',
        imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
        heat:  10,
        userId: 'qsomihvqios',
      },
      {
        _id: 'oeihfzeomoihi',
        title: 'Mon deuxième objet',
        description: 'Les infos de mon deuxième objet',
        imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
        price: 2900,
        userId: 'qsomihvqios',
      },
    ];
    res.status(200).json(stuff);
  });
*/

module.exports = app;