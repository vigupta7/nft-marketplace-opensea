const dotenv = require('dotenv');
dotenv.config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: console.log,
  logQueryParameters: true,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

//sequelize.config.longStackTraces=true;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models/tables
db.categories = require('../module/category/model/categoryModel.js')(sequelize, Sequelize);
db.users = require('../module/user/model/userModel.js')(sequelize, Sequelize);
db.collections = require('../module/collection/model/collectionModel.js')(sequelize, Sequelize);
db.options = require('../module/common/model/optionsModel.js')(sequelize, Sequelize);
db.favourites = require('../module/item/model/favouriteModel.js')(sequelize, Sequelize);
db.buyRequests = require('../module/item/model/buyRequestModel.js')(sequelize, Sequelize);
db.histories = require('../module/item/model/historyModel.js')(sequelize, Sequelize);
db.items = require('../module/item/model/itemModel.js')(sequelize, Sequelize);
db.offers = require('../module/item/model/offerModel.js')(sequelize, Sequelize);
db.prices = require('../module/item/model/priceModel.js')(sequelize, Sequelize);
db.views = require('../module/item/model/viewModel.js')(sequelize, Sequelize);

db.collections.hasMany(db.items, {
  as: "itemCollection",
  foreignKey: "collection_id",
});

db.categories.hasMany(db.items, {
  as: "itemCategory",
  foreignKey: "category_id",
});

db.users.hasMany(db.items, {
  as: "itemOwner",
  foreignKey: "current_owner",
});

db.users.hasMany(db.items, {
  as: "itemAuthor",
  foreignKey: "author_id",
});

db.users.hasMany(db.offers, {
  as: "userSender",
  foreignKey: "sender",
});

db.users.hasMany(db.offers, {
  as: "userReceiver",
  foreignKey: "receiver",
});

db.users.hasMany(db.histories, {
  as: "userFrom",
  foreignKey: "from_id",
});

db.users.hasMany(db.histories, {
  as: "userTo",
  foreignKey: "to_id",
});

db.users.hasMany(db.prices, {
  as: "user_Price",
  foreignKey: "user_id",
});

db.items.hasMany(db.offers, {
  as: "item_Offers",
  foreignKey: "item_id",
});

db.items.hasMany(db.prices, {
  as: "item_Price",
  foreignKey: "item_id",
});

db.users.hasMany(db.favourites, {
  as: "user_Favorite",
  foreignKey: "user_id",
});

db.items.hasMany(db.favourites, {
  as: "item_Favorite",
  foreignKey: "item_id",
});

db.items.hasMany(db.histories, {
  as: "item_History",
  foreignKey: "item_id",
});

db.collections.hasMany(db.histories, {
  as: "collection_History",
  foreignKey: "collection_id",
});
/////////////////////////////////////////////////////////////////////////////////////

db.favourites.belongsTo(db.users, {
  foreignKey: "user_id",
  as: "userFavorite"
});

db.favourites.belongsTo(db.items, {
  foreignKey: "item_id",
  as: "itemFavorite"
});

db.items.belongsTo(db.collections, {
  foreignKey: "collection_id",
  as: "collection"
});

db.items.belongsTo(db.categories, {
  foreignKey: "category_id",
  as: "category"
});

db.items.belongsTo(db.users, {
  foreignKey: "current_owner",
  as: "owner"
});

db.items.belongsTo(db.collections, {
  foreignKey: "author_id",
  as: "author"
});

db.items.belongsTo(db.prices, {
  foreignKey: "item_id",
  as: "itemPrice"
});

db.histories.belongsTo(db.users, {
  foreignKey: "from_id",
  as: "fromUser"
});

db.histories.belongsTo(db.users, {
  foreignKey: "to_id",
  as: "toUser"
});

db.offers.belongsTo(db.users, {
  foreignKey: "sender",
  as: "senderUser"
});

db.offers.belongsTo(db.users, {
  foreignKey: "receiver",
  as: "receiverUser"
});

db.offers.belongsTo(db.items, {
  foreignKey: "item_id",
  as: "itemOffer"
});

db.histories.belongsTo(db.items, {
  foreignKey: "item_id",
  as: "itemHistory"
});

db.histories.belongsTo(db.collections, {
  foreignKey: "collection_id",
  as: "collectionHistory"
});

db.prices.belongsTo(db.users, {
  foreignKey: "user_id",
  as: "userPrice"
});

db.getPagingData = (result, page, offset, limit) => {
  //console.log("result = ",result);
  const { count: totalDocs, rows: docs } = result;
  let prev_page = null;
  let next_page = null;
  let h_p_p = null;
  let h_n_p = null;
  let page_count = Math.ceil((totalDocs / limit));

  // if (page >= page_count ){  // 2 3 
  //     next_page = 0;
  // }  

  if (page >= 1 && page < page_count) {
    next_page = page + 1;
    h_n_p = true;
  } else {
    //next_page = 0;
    h_n_p = false;
  }

  if (page <= 1) {
    //prev_page =0;
    h_p_p = false;
  } else {
    prev_page = page - 1;
    h_p_p = true;
  }

  return {
    "docs": docs,
    "totalDocs": totalDocs,
    "offset": offset,
    "limit": limit,
    "totalPages": page_count,
    "page": page,
    "pagingCounter": offset,
    "hasPrevPage": h_p_p,
    "hasNextPage": h_n_p,
    "prevPage": prev_page,
    "nextPage": next_page
  };
};


module.exports = db;


