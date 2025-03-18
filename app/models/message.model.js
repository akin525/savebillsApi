const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const message = sequelize.define('message', {
        senderId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recipientId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        usertype:{
            type:DataTypes.STRING,
            allowNull: true
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        read:{
            type: DataTypes.STRING,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    return message;
};
