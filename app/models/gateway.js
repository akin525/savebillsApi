module.exports = (sequelize, Sequelize) => {

    return sequelize.define("gateway", {

        method: {
            type: Sequelize
        },
        token: {
            type: Sequelize
        },
        amount: {
            type: Sequelize
        },
        tamount: {
            type: Sequelize
        },
    });
};
