module.exports = (sequelize, Sequelize) => {
    const WaterConsumption = sequelize.define("WaterConsumption", {
        volume: {
            type: Sequelize.STRING
        },
        hour: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.STRING
        }
    });

    return WaterConsumption;
};