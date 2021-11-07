module.exports = app => {
    const waterConsumptions = require("../controllers/water-consumption.controller.js");

    var router = require("express").Router();

    // Create a new waterConsumption
    router.post("/", waterConsumptions.create);

    // Retrieve all waterConsumptions
    router.get("/", waterConsumptions.findAll);

    // // Retrieve all published waterConsumptions
    // router.get("/published", waterConsumptions.findAllPublished);

    // Retrieve a single waterConsumption with id
    router.get("/:id", waterConsumptions.findOne);

    // Update a waterConsumption with id
    router.put("/:id", waterConsumptions.update);

    // Delete a waterConsumption with id
    router.delete("/:id", waterConsumptions.delete);

    // Delete all waterConsumptions
    router.delete("/", waterConsumptions.deleteAll);

    app.use('/api/water-consumption', router);
};