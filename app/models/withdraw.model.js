module.exports = (sequelize, Sequelize) => {
    const withdraw = sequelize.define("withdraws",{

        username: {
            type:Sequelize
        },
       amount: {
            type:Sequelize
        },
        bank: {
            type:Sequelize
        },

        account_no: {
            type:Sequelize
        },
        name: {
            type:Sequelize
        },
        plan: {
            type:Sequelize
        },
        status: {
            type:Sequelize
        },
    });

    return withdraw;
};
