module.exports = (sequelize, Sequelize) => {
    const otp = sequelize.define("otp",{
        pin: {
            type:Sequelize
        },
        username: {
            type:Sequelize
        },
    });
    return otp;
};
