'use strict';
module.exports = (sequelize, DataTypes) => {
  var cataloggeo = sequelize.define('cataloggeo', {
    host: DataTypes.STRING,
    service: DataTypes.STRING,
    component: DataTypes.STRING,
    priority: DataTypes.STRING,
    environment: DataTypes.STRING,
    datacenter: DataTypes.STRING,
    url: DataTypes.STRING
  }, {});
  cataloggeo.associate = function(models) {
    // associations can be defined here
  };
  return cataloggeo;
};