module.exports = (sequelize, Sequelize) => {

    const account= sequelize.define("charps",{

        bank: {
            type:Sequelize
        },
        account_number: {
            type: Sequelize
        },
        account_name: {
            type: Sequelize
        },
    });

    return account;
};
