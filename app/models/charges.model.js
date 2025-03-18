module.exports = (sequelize, Sequelize) => {

    const charges= sequelize.define("charps",{

        username: {
            type:Sequelize
        },
        payment_ref: {
            type: Sequelize
        },
        amount: {
            type: Sequelize
        },
        iwallet: {
            type: Sequelize
        },
        fwallet:{
            type: sequelize
        },
        status: {
            type: Sequelize
        },

    });

    return charges;
};
