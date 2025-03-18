module.exports = (sequelize, Sequelize) => {
    const settings= sequelize.define("settings",{
        email: {
            type: Sequelize
        },
        charges:{
            type: Sequelize
        },
        encryption:{
            type: Sequelize
        },

        squadco:{
            type: Sequelize
        },
        squadco_key:{
            type: Sequelize
        },
        maintain:{
            type:Sequelize
        },
        all:{
            type:Sequelize
        },
        airtime:{
            type:Sequelize
        },
        airtimepin:{
            type:Sequelize
        },
        data:{
            type:Sequelize
        },
        datapin:{
            type:Sequelize
        },
    });

    return settings;
};
