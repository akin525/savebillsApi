module.exports = (sequelize, Sequelize) => {
    const refer = sequelize.define("refers",{

        username: {
            type:Sequelize
        },
        newuserid:{
            type:Sequelize
        },
        status:{
            type:Sequelize
        },


    });

    return refer;
};
