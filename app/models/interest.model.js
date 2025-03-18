module.exports = (sequelize, Sequelize) => {
    const interest = sequelize.define("interests",{
        username: {
            type:Sequelize
        },

        profit: {
            type: Sequelize
        },

    });

    return interest;
};
