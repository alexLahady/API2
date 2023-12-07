const Sauce = require("../models/Sauce");
const fs = require('fs');


function getSauceById(req, res) {
    return Sauce.findOne({ _id: req.params.id })
}



function deleteImage(sauce, req, res) {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, (err => {
        if (err) console.log(err);
    }));
}



exports.getAllSauces = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};



exports.getOneSauce = (req, res) => {
    getSauceById(req, res)
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(500).json({ error }));
};



exports.createSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLikes: [],
        usersDislikes: []
    });
    console.log(sauce)
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.modifySauce = (req, res) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject.userId;
    getSauceById(req, res)
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                res.status(403).json({ message: "Non autorisé !" });
            } else {
                const imageSauce = sauce.imageUrl.split('/images/')[1];
                if (req.file && req.file.filename !== imageSauce) {
                    deleteImage(sauce, req, res);
                }
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};


exports.deleteSauce = (req, res) => {
    getSauceById(req, res)
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({ message: "Non autorisé !" });
            } else {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(401).json({ error }));
                deleteImage(sauce, req, res);
            }
        })
        .catch(error => res.status(500).json({ error }));
};

//Mise à jour du vote Like/Dislike
function udapte(sauce, like, userId, res) {
    if (like === 1 || like === -1) {
        return incrementeVote(sauce, userId, like);
    }
    return resetVote(sauce, userId, res);
}

//Ajout du vote
function incrementeVote(sauce, userId, like) {
    //Récupération des tableaux usersLiked et usersDisliked
    const { usersLiked, usersDisliked } = sauce;

    //Ajout de l'id dans le tableau 
    const tabVote = like === 1 ? usersLiked : usersDisliked; // un if rapide
    if (tabVote.includes(userId)){
        return sauce;
    }
    tabVote.push(userId);

    //Incrémentation du compteur Like ou Dislike 
    if (like === 1 ){
        ++sauce.likes
    } else {
        ++sauce.dislikes;
    }
    return sauce;
}

//Annulation du vote
function resetVote(sauce, userId, res) {
    //Récupération des tableaux usersLiked et usersDisliked
    const { usersLiked, usersDisliked } = sauce;

    //Message d'erreur si l'utilisateur peut liker ET disliker
    if ([usersLiked, usersDisliked].every(arr => arr.includes(userId))){
        return Promise.reject({ message: "L'utilisateur semble avoir voté dans les deux sens !" });
    }

    //Message d'erreur si l'utilisateur n'a pas voté
    if (![usersLiked, usersDisliked].some(arr => arr.includes(userId))){
        return Promise.reject({ message: "L'utilisateur n'a pas voté !" });
    }

    //Retrait de l'id de l'utilisateur du tableau à modifier
    if (usersLiked.includes(userId)) {
        sauce.usersLiked = sauce.usersLiked.filter((id) => id !== userId)
        sauce.likes = sauce.usersLiked.length ; // like en fonction du nombre d'utilisateur
        console.log( sauce.likes );
        console.log( 'longueur du tableau '+sauce.usersLiked.length );
    } else {
        sauce.usersDisliked = sauce.usersDisliked.filter((id) => id !== userId);
        sauce.dislikes = sauce.usersDisliked.length ;// dislike en fonction du nombre d'utilisateur
        console.log( sauce.dislikes );
        console.log( 'longueur du tableau '+sauce.usersDisliked.length );
    }

    return sauce;
}

//Les like et les dislike de la sauce
exports.likeSauce = (req, res) => {
    const {userId, like} = req.body;
    if (![0, -1, 1].includes(like)){
        return res.status(400).json({ message: "Mauvaise Requête"});
    }
    getSauceById(req, res)
        .then((sauce) => udapte(sauce, like, userId))
        .then(saveSauce => saveSauce.save())
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(500).json({ error }));
};

