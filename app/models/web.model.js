module.exports = (sequelize, Sequelize) => {
    const web = sequelize.define("webs",{

        webbook: {
            type:Sequelize
        },


    });

    return web;
};
