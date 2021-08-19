const express = require('express');
const helmet = require('helmet');
const app = express();

//helmet
app.use(helmet());

//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
const path = require('path');
app.use(express.json());



//MANGO DB

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin@clusterp6.wkftz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
   })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  

const userRoutes = require('./routes/user');
const stuffRoutes = require('./routes/stuff');
//Auth
app.use('/api/auth', userRoutes);


app.use('/api/sauces', stuffRoutes);


//Chemin d'acces au dossier images des requettes get
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;