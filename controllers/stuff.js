//CRUD

const Sauce = require('../models/stuff');
const fs = require('fs');

//AJOUT D'UNE SAUCE
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({...sauceObject, imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`});
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

//DETAILS D'UNE SAUCE
exports.getOneSauce = (req, res, next) => {
Sauce.findOne({_id: req.params.id})
  .then((sauce) => {res.status(200).json(sauce);})
  .catch((error) => {res.status(404).json({error});});
};

//MODIFIER UNE SAUCE
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

//SUPPRIMER UNE SAUCE
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


//ENVOYER TOUTES LES SAUCES
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(400).json({error});});
};

//LIKER OU DISLIKER UNE SAUCE
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      //RECUPERATION DES VALEURS (userLiked et userDisliked) A MODIFIER DANS LA BDD
      const valeursSauce = {
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
        likes: 0,
        dislikes: 0,
      }
      switch (req.body.like) {
        case 1:  //LIKE
          valeursSauce.usersLiked.push(req.body.userId);
          break;
        case -1:  //DISLIKE
          valeursSauce.usersDisliked.push(req.body.userId);
          break;
        case 0:
          if (valeursSauce.usersLiked.includes(req.body.userId)) {
            // RETIRER SON LIKE
            const index = valeursSauce.usersLiked.indexOf(req.body.userId);
            valeursSauce.usersLiked.splice(index, 1);
          } 
          else {
            //RETIRER SON DISLIKE
            const index = valeursSauce.usersDisliked.indexOf(req.body.userId);
            valeursSauce.usersDisliked.splice(index, 1);
          }
          break;
      };
      // CALCUL LIKE ET DISLIKE EN FONCTION DE LA LENGTH DES USERSLIKED ET USERDISLIKED
      valeursSauce.likes = valeursSauce.usersLiked.length;
      valeursSauce.dislikes = valeursSauce.usersDisliked.length;

      //MISE A JOUR DES VALEURS
      Sauce.updateOne({ _id: req.params.id }, valeursSauce )
          .then(() => res.status(200).json({ message: 'Sauce notée !' }))
          .catch(error => res.status(400).json({ error }))  
    })
    .catch(error => res.status(500).json({ error }));
}