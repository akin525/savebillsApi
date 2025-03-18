module.exports = (sequelize, Sequelize) => {

    const profit= sequelize.define("profits",{

        username: {
            type:Sequelize
        },
        amount: {
            type: Sequelize
        },
        plan: {
            type: Sequelize
        },
    });

    return profit;
};
