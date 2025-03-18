module.exports = (sequelize, Sequelize) => {
    const mcd = sequelize.define("mcd",{
        plan_id: {
            type: Sequelize.STRING
        },
        cat_id: {
            type: Sequelize.STRING
        },
        network: {
            type: Sequelize.STRING
        },
        category: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING
        },
        server: {
            type: Sequelize.STRING
        },
        plan: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.STRING
        },
        tamount: {
            type: Sequelize.STRING
        },
        ramount: {
            type: Sequelize.STRING
        },
    });
    return mcd;
};
