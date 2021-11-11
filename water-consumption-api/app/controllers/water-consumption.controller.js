const db = require("../models");
const WaterConsumption = db.waterConsumption;
const Op = db.Sequelize.Op;

// Create and Save a new WaterConsumption
exports.create = (req, res) => {
    // Validate request
    if (!req.body.volume) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a WaterConsumption
    const waterConsumption = {
        volume: req.body.volume,
        hour: req.body.hour,
        date: req.body.date,
    };

    // Save WaterConsumption in the database
    WaterConsumption.create(waterConsumption)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the WaterConsumption."
            });
        });
};

// Retrieve all WaterConsumptions from the database.
exports.findAll = (req, res) => {
    const volume = req.query.volume;
    var condition = volume ? {
        volume: {
            [Op.like]: `%${volume}%`
        }
    } : null;

    WaterConsumption.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving WaterConsumptions."
            });
        });
};

// Find a single WaterConsumption with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    WaterConsumption.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving WaterConsumption with id=" + id
            });
        });
};

// Update a WaterConsumption by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    WaterConsumption.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "WaterConsumption was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update WaterConsumption with id=${id}. Maybe WaterConsumption was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating WaterConsumption with id=" + id
            });
        });
};

// Delete a WaterConsumption with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    WaterConsumption.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "WaterConsumption was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete WaterConsumption with id=${id}. Maybe WaterConsumption was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete WaterConsumption with id=" + id
            });
        });
};

// Delete all WaterConsumptions from the database.
exports.deleteAll = (req, res) => {
    WaterConsumption.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} WaterConsumptions were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all WaterConsumptions."
            });
        });
};

// find all published WaterConsumption
// exports.findAllPublished = (req, res) => {
//     WaterConsumption.findAll({ where: { published: true } })
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while retrieving WaterConsumptions."
//             });
//         });
// };