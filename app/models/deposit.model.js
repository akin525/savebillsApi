module.exports = (sequelize, Sequelize) => {
    const deposit = sequelize.define("deposits",{
        status: {
            type: Sequelize
        },
        username: {
            type:Sequelize
        },
        payment_ref: {
            type: Sequelize
        },
        amount: {
            type: Sequelize
        },
        narration:{
            type: sequelize
        },
        iwallet: {
            type: Sequelize
        },
        fwallet: {
            type: Sequelize
        },
        date: {
            type: Sequelize
        },
    });

    deposit.belongsTo(sequelize.models.bos, { foreignKey: 'username', as: 'bill' });

    return deposit;
};
