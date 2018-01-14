const http = require('http');
const nodeCouchDB = require("node-couchdb");
const couch = new nodeCouchDB("localhost", 5984);
const dbName = "my_spot";
const usersDocID = "users";

const serverFunctions = {
	/**
	 * Reads the type of request and calls the corresponding function
	 * method executeAction
	 * @param  {Object}   reqData  Request data
	 * @param  {Function} callback Callback function to return result on finish
	 */
	executeAction: function (reqData, callback) {
		var actionType = reqData.type;
		var data = reqData.data;
		if (serverFunctions[actionType]) {
			serverFunctions[actionType](data, callback);
		} else {
			callback(serverFunctions.createErrorObject(actionType, "Unknown action type!"));
		}
	},

	/**
	 * Edits (update or delete) a place record in a User document
	 * method editPlaceInUserDoc
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             _id					Id of document
	 *                             placeID			Id of place record
	 *                             newPlaceData	New data for the place record
	 *                             isDelete			Flag for delete or edit
	 * @param  {Function} callback Callback function to return result on finish
	 */
	editPlaceInUserDoc: function (userData, callback) {
		serverFunctions.getDocumentById(userData._id, function (userDoc) {
			if (userData.isDelete) {
				delete userDoc.places[userData.placeID];
			} else {
				userDoc.places[userData.placeID] = userData.newPlaceData;
			}
			serverFunctions.updateDocument(userDoc, function (status) {
				callback(status || serverFunctions.createErrorObject("editPlace", "The server ran into an error while updating a record!"));
			});
		});
	},

	/**
	 * Creates a place record in a User document
	 * method addPlaceToUserDoc
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             _id				Id of document
	 *                             placeData	Data for the new place records
	 * @param  {Function} callback Callback function to return result on finish
	 */
	addPlaceToUserDoc: function (userData, callback) {
		couch.uniqid().then(function (ids) {
			serverFunctions.getDocumentById(userData._id, function (userDoc) {
				userDoc.places[ids[0]] = userData.placeData;
				serverFunctions.updateDocument(userDoc, function (status) {
					callback(status || serverFunctions.createErrorObject("addPlaceToUserDoc", "The server ran into an error while updating a user document!"));
				});
			});
		});
	},

	/**
	 * Returns a User document by a given id
	 * method getUserDocument
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             _id				Id of document
	 * @param  {Function} callback Callback function to return result on finish
	 */
	getUserDocument: function (userData, callback) {
		serverFunctions.getDocumentById(userData._id, function (userDoc) {
			callback(userDoc);
		});
	},

	/**
	 * Adds a new user to Users document
	 * method addUserAndCreateDoc
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             mail				E-mail of user
	 *                             password		Password of user
	 *                             firstName	First name of user
	 *                             lastName		Last name  of user
	 *                             birthdate	Birthdate of user
	 * @param  {Function} callback Callback function to return result on finish
	 */
	addUserAndCreateDoc: function (userData, callback) {
		serverFunctions.getDocumentById(usersDocID, function (usersDoc) {
			var userInDb = usersDoc[userData.mail];
			if (userInDb) {
				callback(serverFunctions.createErrorObject("addUserAndCreateDoc", "A user with this e-mail already exists!"));
			}	else {
				serverFunctions.createUserDocument(userData, function (userDocId) {
					if (userDocId) {
						usersDoc[userData.mail] = {
							"id": userDocId,
							"password": userData.password
						};
						serverFunctions.updateDocument(usersDoc, function (result) {
							if (result) {
								callback(userDocId);
							} else {
								callback(serverFunctions.createErrorObject("addUserAndCreateDoc", "The server ran into an error while adding user!"));
							}
						});
					} else {
						callback(serverFunctions.createErrorObject("addUserAndCreateDoc", "The server ran into an error while creating user document!"));
					}
				});
			}
		});
	},

	/**
	 * Creates a User document
	 * method createUserDocument
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             mail				E-mail of user
	 *                             password		Password of user
	 *                             firstName	First name of user
	 *                             lastName		Last name  of user
	 *                             birthdate	Birthdate of user
	 * @param  {Function} callback Callback function to return result on finish
	 */
	createUserDocument: function (userData, callback) {
		couch.uniqid().then(function (ids) {
			docID = ids[0];
			userData["_id"] = docID;
			userData["places"] = {};
			couch.insert(dbName, userData).then(function (doc) {
				callback(doc.data.id);
			}, function (err) {
				callback(null);
			});
		});
	},

	/**
	 * Checks if user exists in Users document
	 * method doesUserExist
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             mail				E-mail of user
	 *                             password		Password of user
	 * @param  {Function} callback Callback function to return result on finish
	 */
	doesUserExist: function (userData, callback) {
		serverFunctions.getDocumentById(usersDocID, function (usersDoc) {
			var userInDb = usersDoc[userData.mail];
			if (userInDb) {
				if (userData.password === userInDb.password) {
					callback(userInDb);
				} else {
					callback(serverFunctions.createErrorObject("doesUserExist", "Wrong user name or password!"));
				}
			}	else {
				callback(serverFunctions.createErrorObject("doesUserExist", "User not found!"));
			}
		});
	},

	/**
	 * Edits user data
	 * method editUser
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             _id				Id of document
	 *                             mail				E-mail of user
	 *                             password		Password of user
	 *                             firstName	First name of user
	 *                             lastName		Last name  of user
	 *                             birthdate	Birthdate of user
	 *                             isDelete		Flag for delete or edit
	 * @param  {Function} callback Callback function to return result on finish
	 */
	editUser: function (userData, callback) {
		serverFunctions.getDocumentById(usersDocID, function (usersDoc) {
			if (userData.isDelete) {
				serverFunctions.deleteUserDoc(userData, function (status) {
					if (status) {
						delete usersDoc[userData.mail];
						serverFunctions.updateDocument(usersDoc, function (stat) {
							callback(stat);
						});
					} else {
						callback(serverFunctions.createErrorObject("editUser", "The server ran into an error while deleting a user!"));
					}
				});
			} else {
				usersDoc[userData.mail].password = userData.password;
				serverFunctions.updateDocument(usersDoc, function (status) {
					if (status) {
						serverFunctions.editUserDoc(userData, function (result) {
							if (result) {
								callback(result || serverFunctions.createErrorObject("editUser", "The server ran into an error while updating a User document!"));
							}
						});
					} else {
						callback(serverFunctions.createErrorObject("editUser", "The server ran into an error while updating a user!"));
					}
				});
			}
		});
	},

	/**
	 * Edits (update or delete) user information in a User document
	 * method editUserDoc
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             mail				E-mail of user
	 *                             password		Password of user
	 *                             firstName	First name of user
	 *                             lastName		Last name  of user
	 *                             birthdate	Birthdate of user
	 * @param  {Function} callback Callback function to return result on finish
	 */
	editUserDoc: function (userData, callback) {
		serverFunctions.getDocumentById(userData._id, function (userDoc) {
			userData.places = userDoc.places;
			userData._rev = userDoc._rev;
			serverFunctions.updateDocument(userData, function (status) {
				callback(status || serverFunctions.createErrorObject("editUserDoc", "The server ran into an error while updating a User document!"));
			});
		});
	},

	/**
	 * Deletes a User document
	 * method deleteUserDoc
	 * @param  {Object}   userData Data for executing the function, containing:
	 *                             _id					Id of document
	 * @param  {Function} callback Callback function to return result on finish
	 */
	deleteUserDoc: function (userData, callback) {
		serverFunctions.getDocumentById(userData._id, function (userDoc) {
			couch.del(dbName, userDoc._id, userDoc._rev).then(function (doc) {
				callback(true);
			}, function (err) {
				callback(false);
			});
		});
	},

	/**
	 * Updates the content of a document
	 * method updateDocument
	 * @param  {Object}   updateObj Updated content of the document
	 * @param  {Function} callback  Callback function to return result on finish
	 */
	updateDocument: function (updateObj, callback) {
		couch.update(dbName, updateObj).then(function (doc) {
			callback(true);
		}, function (err) {
			callback(false);
		});
	},

	/**
	 * Returns a document by a given id
	 * method getDocumentById
	 * @param  {String}   id       Id of document
	 * @param  {Function} callback Callback function to return result on finish
	 */
	getDocumentById: function (id, callback) {
		couch.get(dbName, id).then(function (doc) {
				callback(doc.data);
			}, function (err) {
				console.error(err);
		});
	},

	/**
	 * Creates an error object with a name and message
	 * method createErrorObject
	 * @param  {String} name    Name of error
	 * @param  {String} message Message of error
	 * @return {Object}         The message in the form of an object
	 */
	createErrorObject: function (name, message) {
		
		return {name, message};
	}
};

const server = http.createServer(function (request, response) {
	var requestParams = "";

	var onReadySendBack = function (backData) {
		if (!backData) {
			backData = serverFunctions.createErrorObject("serverUnknown", "Server ran into an error!");
		}
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.writeHead(200, "OK", {
			"Content-Type": "application/json; charset=utf-8"
		});
		response.end(JSON.stringify(backData));
	};

	if (request.method === "POST") {
		request.on('data', function(chunk) {
			requestParams += chunk;
		});

		request.on('end', function() {
			requestParams = JSON.parse(requestParams);
			// console.log(requestParams);
			serverFunctions.executeAction(requestParams, onReadySendBack);
		});

		request.on('error', function(err) {
			console.error(err.message);
			onReadySendBack("Error on request: " + err.message);
		});
	} else { //GET
		onReadySendBack(serverFunctions.createErrorObject("serverGET", "Server does not support GET method!"));
	}
});

server.listen(1992, function () {
	console.log("Server started on port 1992!");
});