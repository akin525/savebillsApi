module.exports = (sequelize, Sequelize) => {

    return sequelize.define("general_market", {

        product: {
            type: Sequelize
        },
        amount: {
            type: Sequelize
        },
    });
};
