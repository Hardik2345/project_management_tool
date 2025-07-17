const Client = require("../models/clientModel");
const handlerFactory = require("./handlerFactory");

exports.getAllClients = handlerFactory.getAll(Client);
exports.getClient = handlerFactory.getOne(Client);
exports.createClient = handlerFactory.createOne(Client);
exports.updateClient = handlerFactory.updateOne(Client);
exports.deleteClient = handlerFactory.deleteOne(Client);
