module.exports = (sequelize, Sequelize) => {
    const WaterConsumption = sequelize.define("WaterConsumption", {
        volume: {
            type: Sequelize.STRING
        }
    });

    return WaterConsumption;
};