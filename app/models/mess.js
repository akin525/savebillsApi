const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("messes", {

        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize
        },


    });
};
