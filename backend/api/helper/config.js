/*
Project : Cryptotrades
FileName :  config.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which maintain globl variable for the application
*/
const config = {
  app: {
    port: 3000
  },
  mail: {
    type: "",
    smtp: {
      host: "smtp.sendgrid.net",
      secure: false,
      port: 587,
      username: '',
      password: ''
    }
  },
  site_name: 'MarketPlace',
  site_link: '#',
  site_email: '',
  secret_key: '',
  converstion_url: "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
  rpcurl: "", // infura URL
};


module.exports = config;