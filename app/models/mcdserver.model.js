module.exports = (sequelize, Sequelize) => {
    return sequelize.define("mcdserver", {
        status: {
            type: Sequelize.NUMERIC
        },
        name: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.NUMERIC
        },

    });
};
