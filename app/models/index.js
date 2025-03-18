const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.bill=require("../models/bill.model.js")(sequelize, Sequelize);
db.safelock=require("../models/safelock.model.js")(sequelize, Sequelize);
db.data=require("../models/data.model.js")(sequelize, Sequelize);
db.datanew=require("../models/mcd.model.js")(sequelize, Sequelize);
db.dataserver=require("../models/mcdserver.model.js")(sequelize, Sequelize);
db.deposit=require("../models/deposit.model.js")(sequelize, sequelize);
db.settings=require("../models/settings.model.js")(sequelize, sequelize);
db.charges=require("../models/charges.model.js")(sequelize, sequelize);
db.profit=require("../models/profit.model.js")(sequelize, sequelize);
db.refer=require("../models/refer.model.js")(sequelize, sequelize);
db.web=require("../models/web.model.js")(sequelize, sequelize);
db.message=require("../models/message.model.js")(sequelize, sequelize);
db.interest=require("../models/interest.model.js")(sequelize, sequelize);
db.withdraw=require("../models/withdraw.model.js")(sequelize, sequelize);
db.otp=require("../models/otp.model")(sequelize, sequelize);
db.gateway=require("../models/gateway")(sequelize, sequelize);
db.gmarket=require("../models/general")(sequelize, sequelize);
// db.messages=require("../models/mess")(Sequelize, Sequelize);
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.ROLES = ["user", "admin", "moderator"];
db.message.belongsTo(db.user, { as: 'Sender', foreignKey: 'senderId' });
db.message.belongsTo(db.user, { as: 'Recipient', foreignKey: 'recipientId' });
module.exports = db;
