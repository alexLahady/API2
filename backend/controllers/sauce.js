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
    console.log(JSON.parse(req.body.sauce));
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
                //Si modification de l'image, suppression de l'image précédente
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




