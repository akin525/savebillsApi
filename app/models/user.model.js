module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    name: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    wallet: {
      type: Sequelize.STRING
    },
    bank: {
      type: Sequelize.STRING
    },
    bank1: {
      type: Sequelize.STRING
    },
    account_number: {
      type: Sequelize.STRING
    },
    account_number1: {
      type: Sequelize.STRING
    },
    account_name: {
      type: Sequelize.STRING
    },
    account_name1: {
      type: Sequelize.STRING
    },
    gender: {
      type: Sequelize.STRING
    },
    dob: {
      type: Sequelize.STRING
    },
    apikey: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    pin: {
      type: Sequelize.STRING
    },
    is_verify: {
      type: Sequelize.STRING
    },
    point: {
      type: Sequelize.STRING
    },
    cashback: {
      type: Sequelize.STRING
    },
    reward: {
      type: Sequelize.STRING
    },
    applogin: {
      type: Sequelize.STRING
    },
    timeappopen: {
      type: Sequelize.STRING
    },
    '15minrewarded': {
      type: Sequelize.STRING
    },
    '5minrewarded':{
      type:Sequelize.STRING
    },
    earnrewardtime:{
      type:Sequelize.STRING
    },
    earnrewardtimes:{
      type:Sequelize.STRING
    },
    day1:{
      type:Sequelize.STRING
    },
    day2:{
      type:Sequelize.STRING
    },
    day3:{
      type:Sequelize.STRING
    },
    day4:{
      type:Sequelize.STRING
    },
    day5:{
      type:Sequelize.STRING
    },
    day6:{
      type:Sequelize.STRING
    },
    day7:{
      type:Sequelize.STRING
    },

    role:{
      type:Sequelize.STRING
    },
  });

  return User;
};
