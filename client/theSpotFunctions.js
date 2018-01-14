var theSpot = {
	userData: {},

	login: {
		loginContainer: document.querySelector(".startDivBody"),

		/**
		 * Adds more input fields to the login form to make it to a register form
		 * @method addRegisterFields 
		 */
		addRegisterFields: function () {
			var rows = theSpot.login.loginContainer.querySelectorAll("tr");
			rows[2].style.display = "none";
			for (var i = 3; i < rows.length; i++) {
				rows[i].style.display = "";
			}
		},

		/**
		 * Shows or hides the login form depending on the flag show
		 * @method toggleLoginContVisibility
		 * @param  {boolean} show Show or hide the container
		 */
		toggleLoginContVisibility: function (show) {
			var cont = theSpot.login.loginContainer;
			if (show) {
				cont.style.display = "";
				setTimeout(function () {
					cont.style.opacity = "";
				}, 10);
			} else {
				cont.style.display = "none";
				setTimeout(function () {
					cont.style.opacity = 0;
				}, 10);
			}
		},

		/**
		 * Checks if all fields for login are filled and sends a request for login. A message is diplayed if an error occurs
		 * @method loginHandler
		 */
		loginHandler: function () {
			theSpot.navigation.toggleLoadingVisibility(true);
			var inputs = theSpot.login.loginContainer.querySelectorAll("input");
			var mail = inputs[0].value;
			var password = inputs[1].value;
			if (mail !== "" && password !== "") {
				var reqParams = {
					type: "doesUserExist",
					data: {mail, password}
				};
				theSpot.server.requestDataFromTheSpot(reqParams, function(data) {
					if (data.id) {
						theSpot.login.closeLogin(data);
					} else {
						alert(data.message);
					}
					theSpot.navigation.toggleLoadingVisibility(false);
				});
			} else {
				alert("Please fill in your e-mail and password!");
			}
		},

		/**
		 * Checks if all fields are correctly set and sends a request for registering a new user. A message is diplayed if an error occurs
		 * @method registerAndLoginHandler
		 */
		registerAndLoginHandler: function () {
			var inputs = theSpot.login.loginContainer.querySelectorAll("input");
			if (theSpot.utils.validateInputs(inputs)) {
				if (inputs[1].value === inputs[2].value) {
					theSpot.navigation.toggleLoadingVisibility(true);
					var date = inputs[4].value.split("-");
					var dataObj = {
						mail: inputs[0].value,
						password: inputs[1].value,
						firstName: inputs[3].value,
						lastName: inputs[4].value
					};
					dataObj.birthdate = {
						year: parseInt(date[0], 10),
						month: parseInt(date[1], 10),
						day: parseInt(date[2], 10)
					}
					var reqParams = {
						type: "addUserAndCreateDoc",
						data: dataObj
					};
					theSpot.server.requestDataFromTheSpot(reqParams, function(data) {
						if (data.message) {
							alert(data.message);
						} else {
							theSpot.login.closeLogin({
								id: data,
								password: inputs[1].value
							});
						}
						theSpot.navigation.toggleLoadingVisibility(false);
					});
				} else {
					alert("Passwords do not match!");
				}
			}
		},

		/**
		 * Logs out the user and shows the login form
		 * @method showLogin
		 */
		showLogin: function () {
			theSpot.navigation.toggleLoadingVisibility(true);
			theSpot.userData = {};
			theSpot.login.toggleLoginContVisibility(true);
			theSpot.navigation.toggleNaigationBarVisibility(false);
			setTimeout(function () {
				theSpot.navigation.toggleLoadingVisibility(false);
			}, 500);
		},

		/**
		 * Hides the login form and sets user properties
		 * @method closeLogin
		 * @param  {object} userCredentials User properties
		 */
		closeLogin: function (userCredentials) {
			theSpot.userData = userCredentials;
			theSpot.navigation.openView('myPlaces');
			theSpot.login.toggleLoginContVisibility(false);
			theSpot.navigation.toggleNaigationBarVisibility(true);
			setTimeout(function () {
				theSpot.navigation.toggleLoadingVisibility(false);
			}, 300);
		},

		/**
		 * Listens for pressing the Enter key to call the loginHandler function
		 * @method keyPressHandler
		 * @param  {integer} keyCode Code of the currently pressed key
		 */
		keyPressHandler: function (keyCode) {
			if (keyCode === 13) {
				theSpot.login.loginHandler();
			}
		}
	},

	navigation: {
		navigationBar: document.querySelector(".navigationBar"),
		viewContainers: document.querySelectorAll(".leftViewContainer"),
		mapContainer: document.querySelector(".mapContainer"),
		loadingContainer: document.querySelector(".loadingScreen"),
		container: document.querySelector(".helpMenuIFrame"),
		
		/**
		 * Changes the color of the selected tab from the navigation bar
		 * @method updateNavBarSelection
		 * @param  {string} optionPrefix Name of the selected tab
		 */
		updateNavBarSelection: function (optionPrefix) {
			var viewOptions = theSpot.navigation.navigationBar.querySelectorAll("li");
			var viewOptionsLen = viewOptions.length;
			var option;
			for (var i = 0; i < viewOptionsLen; i++) {
				option = viewOptions[i];
				if (option.id === "navBar_" + optionPrefix) {
					option.style.backgroundColor = "var(--darkblue-color)";
				} else {
					option.style.backgroundColor = "";
				}
			}
		},

		/**
		 * Opens selected view
		 * @method openView
		 * @param  {string} view Selected view
		 */
		openView: function (view) {
			theSpot.navigation.toggleLoadingVisibility(true);
			theSpot.navigation.updateNavBarSelection(view);
			var viewContainersLen = theSpot.navigation.viewContainers.length;
			if (view === "home") {
				theSpot.navigation.mapContainer.style.width = "100%";
			} else {
				theSpot.navigation.mapContainer.style.width = "60%";
			}
			var cont;
			for (var i = 0; i < viewContainersLen; i++) {
				cont = theSpot.navigation.viewContainers[i];
				cont.innerHTML = "";
				if (cont.className.match(view)) {
					theSpot[view].init();
					cont.style.width = "40%";
				} else {
					cont.style.width = "0%";
				}
			}
		},

		/**
		 * Shows or hides the navigation bar depending on the flag show
		 * @method toggleNaigationBarVisibility
		 * @param  {boolean} show Show or hide the bar
		 */
		toggleNaigationBarVisibility: function (show) {
			if (show) {
				theSpot.navigation.navigationBar.style.height = "4em";
			} else {
				theSpot.navigation.navigationBar.style.height = "";
			}
		},

		/**
		 * Shows or hides the loading screen depending on the flag makeVisible
		 * @method toggleLoadingVisibility
		 * @param  {boolean} makeVisible Show or hide the bar
		 */
		toggleLoadingVisibility: function (makeVisible) {
			var loadingContainer = theSpot.navigation.loadingContainer;
			if (makeVisible) {
				// loadingContainer.style.opacity = 0;
				loadingContainer.style.display = "block";
				setTimeout(function () {
					loadingContainer.style.opacity = 0.5;
				}, 0);
			} else {
				loadingContainer.style.opacity = 0;
				setTimeout(function () {
					loadingContainer.style.display = "none";
				}, 300);
			}
		},


		/**
		 * Shows or hides the help menu depending on the flag makeVisible
		 * @method toggleHelpMenuVisibility
		 * @param  {boolean} makeVisible Show or hide the bar
		 */
		toggleHelpMenuVisibility: function (makeVisible) {
			var container = theSpot.navigation.container;
			if (makeVisible) {
				theSpot.navigation.toggleLoadingVisibility(true);
				container.style.display = "block";
			} else {
				theSpot.navigation.toggleLoadingVisibility(false);
				container.style.opacity = 0;
				setTimeout(function () {
					container.style.display = "none";
					container.style.opacity = "";
				}, 300);
			}
		},

		/**
		 * Expand a selected help item from the help menu and shrinkes the rest
		 * @method expandHelpItem
		 * @param  {HTMLElement} seletedItem Selected help item
		 */
		expandHelpItem: function (seletedItem) {
			seletedItem = seletedItem.querySelector("img");
			var titles = document.querySelectorAll(".helpItem .title img");
			var bodies = document.querySelectorAll(".helpItem .body");
			for (var i = 0; i < titles.length; i++) {
				if (titles[i] === seletedItem && titles[i].style.transform === "") {
					titles[i].style.transform = "rotateZ(-90deg)";
					bodies[i].style.padding = "1em";
					bodies[i].style.height = "auto";
				} else {
					titles[i].style.transform = "";
					bodies[i].style.padding = "";
					bodies[i].style.height = "";
				}
			}
		}
	},

	myPlaces: {
		allPlaces: null,
		selectedCategories: [],
		textFilter: "",
		container: document.getElementsByClassName("leftViewContainer myPlaces")[0],

		/**
		 * Renders the myPlaces user interface
		 * @method init
		 */
		init: function () {
			var reqParams = {
				type: "getUserDocument",
				data: {
					_id: theSpot.userData.id
				}
			};
			theSpot.server.requestDataFromTheSpot(reqParams, function(data) {
				theSpot.myPlaces.allPlaces = data.places;
				var html = ['<div class="filters">'];
				html.push('<div class="defaultButton" name="categs"><span title="Filter by categories">Categories</span>');
				html.push('<div class="categoriesContainer">No categories!<br/>Add more places with categories</div></div>');
				html.push('<div class="defaultButton" style="float: right;" onmousedown="theSpot.myPlaces.filterByText()">Search</div>');
				html.push('<input class="defaultInput" onkeydown="theSpot.myPlaces.keyPressHandler(event.keyCode)" type="search" title="Filter by key-words (in the name and the description)" style="margin: 0px 1em; float: right; width: 40%;" oninput="theSpot.myPlaces.updateTextFilter(this)" placeholder="Enter search text here..."/>');
				html.push('</div><ul><span>No places found!</span></ul>');
				theSpot.myPlaces.container.innerHTML = html.join('');
				if (Object.keys(data.places).length > 0) {
					theSpot.myPlaces.refreshPlacesListHTML();
					theSpot.mapFunctions.addMarkersToMap(data.places);
					theSpot.myPlaces.populateCategoriesList();
				}
				theSpot.navigation.toggleLoadingVisibility(false);
			});
		},

		/**
		 * Adds the saved records in the library list and on the maps
		 * @method refreshPlacesListHTML
		 */
		refreshPlacesListHTML: function () {
			var parent = theSpot.myPlaces.container.querySelector("ul");
			var image = "";
			var defaultImage = "url('images/noImage.png')";
			var placesList = [];
			var places = theSpot.myPlaces.allPlaces;
			for (var pid in places) {
				if (theSpot.myPlaces.passesTextFiltration(places[pid]) && theSpot.myPlaces.passesCategoryFiltration(places[pid])) {
					image = places[pid].image || defaultImage;
					placesList.push('<li>');
						placesList.push('<div class="place_image" style="background-image: ' + image + '"></div>');
						placesList.push('<div class="place_info">');
							placesList.push('<span onmousedown="theSpot.myPlaces.sendDataForInfo(\'' + pid + '\')" style="cursor:pointer;">' + places[pid].name + '</span><br/>');
							if (places[pid].category) {
								placesList.push('<span style="font-size: 70%;">' + places[pid].category.join(", ") + '</span>');
							}
							// placesList.push('<span style="font-size: 70%;">' + places[pid].latitude + ', ' + places[pid].longitude + '</span>');
						placesList.push('</div>');
						placesList.push('<div class="place_description">');
							placesList.push(places[pid].description);
						placesList.push('</div>');
						placesList.push('<div class="place_tools">');
							placesList.push('<div class="edit" title="Edit place" onmousedown="theSpot.myPlaces.editHandler(\'' + pid + '\')"></div>');
							placesList.push('<div class="delete" title="Delete place" onmousedown="theSpot.myPlaces.deleteHandler(\'' + pid + '\')"></div>');
						placesList.push('</div>');
					placesList.push('</li>');
				}
			}
			parent.innerHTML = placesList.join('');
		},

		/**
		 * Creates an information window for the map
		 * @method sendDataForInfo
		 * @param  {string} id ID of record
		 */
		sendDataForInfo: function (id) {
			var content = [];
			var infoObj = theSpot.myPlaces.allPlaces[id];
			content.push('<div class="infoWindowTitle">' + infoObj.name + '</div>');
			content.push('<div class="infoWindowContent"><span class="propertySpan">Coordinates: </span><span>' + infoObj.latitude + ', ' + infoObj.longitude + '</span></div>');
			if (infoObj.address) {
				var addressString = (infoObj.address.street ? infoObj.address.street : "");
				addressString += " " + (infoObj.address.number ? infoObj.address.number : "");
				addressString += ", " + (infoObj.address.postalCode ? infoObj.address.postalCode : "");
				addressString += " " + (infoObj.address.city ? infoObj.address.city : "");
				addressString += " " + (infoObj.address.country ? infoObj.address.country : "");
				content.push('<div class="infoWindowContent"><span class="propertySpan">Address: </span><span>' + addressString + '</span></div>');
			}
			if (infoObj.website) {
				content.push('<div class="infoWindowContent"><span class="propertySpan">Website:</span><span><a href="http://' + infoObj.website + '" target="_blank">' + infoObj.website + '<a/></span></div>');
			}
			if (infoObj.phone) {
				content.push('<div class="infoWindowContent"><span class="propertySpan">Phone:</span><span>' + infoObj.phone + '</span></div>');
			}
			theSpot.mapFunctions.showInfoWindow(id, content.join(''));
		},

		/**
		 * Reads all of the categories from all of the records and adds them to the categories lists
		 * @method populateCategoriesList
		 */
		populateCategoriesList: function () {
			var parent = theSpot.myPlaces.container.querySelector(".categoriesContainer");
			var catgories = {};
			for (var item in theSpot.myPlaces.allPlaces) {
				if (theSpot.myPlaces.allPlaces[item].category) {
					theSpot.myPlaces.allPlaces[item].category.forEach(function (cat) {
						catgories[cat] = true;
					});
				}
			}
			catgories = Object.keys(catgories);
			var catgoriesLen = catgories.length;
			var categHTML = ['<table><tbody><tr>'];
			for (var i = 0; i < catgoriesLen; i++) {
				if (i > 0 && i % 2 === 0) {
					categHTML.push('</tr><tr>');
				}
				categHTML.push('<td onmousedown="theSpot.myPlaces.unCheckCategory(this)"><input onclick="return false;" type="checkbox" name="category" value="' + catgories[i] + '"/><span>' + catgories[i] + '</span></td>');
			}
			categHTML.push('</tr></tbody></table>');
			parent.innerHTML = categHTML.join('');
		},

		/**
		 * Handler for checkikng/unchecking a checkbox and respectfully filtering the library list
		 * @param  {HTMLElement} tdElement TD container of the checkbox
		 */
		unCheckCategory: function (tdElement) {
			var checkbox = tdElement.querySelector("input[type=checkbox]");
			if (checkbox.checked) {
				theSpot.myPlaces.selectedCategories.splice(theSpot.myPlaces.selectedCategories.indexOf(checkbox.value), 1);
				checkbox.checked = false;
			} else {
				theSpot.myPlaces.selectedCategories.push(checkbox.value);
				checkbox.checked = true;
			}
			theSpot.myPlaces.refreshPlacesListHTML();
		},

		/**
		 * Updating the textFilter and the library list
		 * @method updateTextFilter
		 * @param  {HTMLElement} input Input for textFilter
		 */
		updateTextFilter: function (input) {
			theSpot.myPlaces.textFilter = input.value;
			// if (theSpot.myPlaces.textFilter === "") {
				theSpot.myPlaces.refreshPlacesListHTML();
			// }
		},

		/**
		 * Filters the library list
		 * @method filterByText
		 */
		filterByText: function () {
			if (theSpot.myPlaces.textFilter !== "") {
				theSpot.myPlaces.refreshPlacesListHTML();
			}
		},

		/**
		 * Checks if the given record corresponds to the text filtration
		 * @method passesTextFiltration
		 * @param  {object} place 	Record from the library list
		 * @return {boolean}       	True if record corresponds to the text filtration, else false
		 */
		passesTextFiltration: function (place) {
			if (theSpot.myPlaces.textFilter === "") {
				return true;
			} else {
				var searchQuery = theSpot.myPlaces.textFilter.toLowerCase()
				return (place.name.toLowerCase().match(searchQuery) || (place.description && place.description.toLowerCase().match(searchQuery)));
			}
		},

		/**
		 * Checks if the given record corresponds to the category filtration
		 * @method passesCategoryFiltration
		 * @param  {object} place 	Record from the library list
		 * @return {boolean}       	True if record corresponds to the text filtration, else false
		 */
		passesCategoryFiltration: function (place) {
			if (theSpot.myPlaces.selectedCategories.length === 0) {
				return true;
			}
			if (place.category) {
				var categoryLen = place.category.length;
				for (var i = 0; i < categoryLen; i++) {
					if (theSpot.myPlaces.selectedCategories.indexOf(place.category[i]) > -1) {
						return true;
					}
				}
			}
			return false;
		},

		/**
		 * Calls the selected record in the edtPlace interface
		 * @param  {string} placeID ID of record
		 */
		editHandler: function (placeID) {
			theSpot.editPlace.setPlaceForEdit(theSpot.myPlaces.allPlaces[placeID], placeID);
			theSpot.navigation.openView('editPlace');
		},

		/**
		 * Asks the user to reenter his password for confirmation and deletes the desired record
		 * @method deleteHandler
		 * @param  {string} placeID ID of record
		 */
		deleteHandler: function (placeID) {
			var confirmation = prompt('Please enter your password to delete "' + theSpot.myPlaces.allPlaces[placeID].name + '"!');
			if (confirmation === theSpot.userData.password) {
				theSpot.navigation.toggleLoadingVisibility(true);
				var reqParams = {
					type: "editPlaceInUserDoc",
					data: {
						_id: theSpot.userData.id,
						placeID: placeID,
						isDelete: true
					}
				};
				theSpot.server.requestDataFromTheSpot(reqParams, function(success) {
					if (success) {
						theSpot.myPlaces.init();
						alert("Delete successful!");
						theSpot.navigation.toggleLoadingVisibility(false);
					} else {
						alert("Delete unsuccessful: something went wrong! Please try again!");
					}
				});
			} else {
				if (confirmation !== null) {
					alert("Delete unsuccessful: incorrect password!");
				}
			}
		},

		/**
		 * Listens for pressing the Enter key to call the filterByText function
		 * @method keyPressHandler
		 * @param  {integer} keyCode Code of the currently pressed key
		 */
		keyPressHandler: function (keyCode) {
			if (keyCode === 13) {
				theSpot.myPlaces.filterByText();
			}
		}
	},

	searchPlace: {
		container: document.getElementsByClassName("leftViewContainer searchPlace")[0],
		searchType: "key-word",
		searchResults: {},
		numReturnedQueries: 0,
		maxResultsFromAPI: 5,
		
		/**
		 * Renders the searchPlace user interface
		 * @method init
		 */
		init: function () {
			theSpot.mapFunctions.clearAllMarkers();
			var html = ['<div class="controls">'];
			html.push('<div class="defaultButton" name="categs" title="Create your own place" onmousedown="theSpot.searchPlace.createNewPlaceHandler()">Create place</div>');
			html.push('<div class="defaultButton" style="float: right;" onmousedown="theSpot.searchPlace.searchHandler()">Search</div>');
			html.push('<input class="defaultInput" oninput="theSpot.searchPlace.clearSearchResults(this)" onkeydown="theSpot.searchPlace.keyPressHandler(event.keyCode)" type="search" style="float: right; margin: 0px 1em; width: 40%;" placeholder="Enter search text here..."/>');
			html.push('<select class="defaultSelect" style="float: right;" onchange="theSpot.searchPlace.searchTypeChanged(this)">');
				html.push('<option value="key-word">Key-word</option>');
				html.push('<option value="coordinates">Coordinates</option>');
				html.push('<option value="sentance">Sentance</option>');
				html.push('<option value="address">Address</option>');
			html.push('</select><br/>');
			html.push('<div class="searchEngine">');
				html.push('<input type="checkbox" name="searchEngine" value="google" checked/><img src="images/google.png"/><span>Google Places</span>');
				html.push('<input type="checkbox" name="searchEngine" value="here" checked/><img src="images/here.png"/><span>Here</span>');
				html.push('<input type="checkbox" name="searchEngine" value="sygic" checked/><img src="images/sygic.png"/><span>Sygic</span>');
			html.push('</div></div><ul></ul>');
			theSpot.searchPlace.container.innerHTML = html.join('');
			theSpot.searchPlace.searchResults = {};
			theSpot.searchPlace.numReturnedQueries = 0;
			theSpot.navigation.toggleLoadingVisibility(false);
		},

		/**
		 * Clears the serch results container and the search query in the input field
		 * @method clearSearchResults
		 * @param  {HTMLElement} input Input for search query
		 */
		clearSearchResults: function (input) {
			if (input.value === "") {
				theSpot.searchPlace.searchResults = {};
				theSpot.searchPlace.container.querySelector("ul").innerHTML = "";
				theSpot.searchPlace.numReturnedQueries = 0;
				theSpot.mapFunctions.clearAllMarkers();
			}
		},

		/**
		 * Listens for change in the search type and makes the required adjustments to the interfaces
		 * @method searchTypeChangeds
		 * @param  {HTMLElement} select Select element for selection of search type
		 */
		searchTypeChanged: function (select) {
			var input = select.parentNode.querySelector("input");
			input.value = "";
			theSpot.searchPlace.clearSearchResults(input);
			var newType = select.value;
			var plchldText = "";
			theSpot.searchPlace.searchType = newType;
			switch (newType) {
				case "coordinates":
					plchldText = "Example: 48.193607, 16.352019";
					break;
				case "address":
					plchldText = "Enter street name, number, postal code, city";
					break;
				// case "key-word":
				// case "sentance":
				default:
					plchldText = "Enter search text here...";
					break;
			}
			input.placeholder = plchldText;
		},

		/**
		 * Calls the editPlace interface with empty filds
		 * @method createNewPlaceHandler
		 */
		createNewPlaceHandler: function () {
			theSpot.editPlace.setPlaceForEdit();
			theSpot.navigation.openView('editPlace');
		},

		/**
		 * Reads the type of search and calls the corresponding function of the serch engines
		 * @method searchHandler
		 */
		searchHandler: function () {
			var inputVal = theSpot.searchPlace.container.querySelector("input").value
			if (inputVal === "") {
				theSpot.navigation.toggleLoadingVisibility(false);
				alert("There is nothing to search for!");
			} else {
				theSpot.navigation.toggleLoadingVisibility(true);
				theSpot.searchPlace.searchResults = {};
				theSpot.searchPlace.numReturnedQueries = 0;
				switch (theSpot.searchPlace.searchType) {
					case "key-word":
						inputVal = inputVal.split(" ")[0]; //only one word (first one)
						theSpot.searchPlace.searchInGooglePlaces(inputVal);
						theSpot.searchPlace.searchInHere(inputVal);
						theSpot.searchPlace.searchInSygic(inputVal);
						break;
					case "coordinates":
						if (inputVal.match(",") && !inputVal.match(/[a-zA-Z]/gim)) {
							inputVal = inputVal.replace(/\s/gim, ""); //remove spaces
							inputVal = inputVal.split(",");
							theSpot.mapFunctions.centerPoint = {
								lat: inputVal[0],
								lng: inputVal[1]
							};
							theSpot.searchPlace.searchInGooglePlaces(inputVal);
							theSpot.searchPlace.searchInHere(inputVal);
							theSpot.searchPlace.searchInSygic(inputVal);
						} else {
							alert("Incorect input!");
							theSpot.navigation.toggleLoadingVisibility(false);
						}
						break;
					case "sentance":
						theSpot.searchPlace.searchInGooglePlaces(inputVal);
						theSpot.searchPlace.searchInHere(inputVal);
						theSpot.searchPlace.searchInSygic(inputVal);
						break;
					case "address":
						theSpot.searchPlace.searchInGooglePlaces(inputVal);
						theSpot.searchPlace.searchInHere(inputVal);
						theSpot.searchPlace.searchInSygic(inputVal);
						break;
					default:
						console.error("Unsuported searchType!");
						break;
				}
			}
		},

		/**
		 * Makes a request to Google Places search engine and returns results corresponding to the query
		 * @method searchInGooglePlaces
		 * @param  {string|array} searchValue Search query of user
		 */
		searchInGooglePlaces: function (searchValue) {
			if (searchValue && document.querySelector('.searchEngine input[value="google"]').checked) {
				var service = new google.maps.places.PlacesService(theSpot.mapFunctions.map);
				var callback = function (results, status) {
					if (status === google.maps.places.PlacesServiceStatus.OK) {
						var newDataObject = {};
						var len = Math.min(theSpot.searchPlace.maxResultsFromAPI, results.length);
						// console.info(results);
						for (var i = 0; i < len; i++) {
							newDataObject["google" + i] = theSpot.searchPlace.normalizeGoogleRecord(results[i]);
						}
						theSpot.searchPlace.populateResultsList(newDataObject);
					}
				};
				if (theSpot.searchPlace.searchType === "coordinates") {
					service.nearbySearch({
						location: new google.maps.LatLng(searchValue[0], searchValue[1]),
						radius: 10,
					}, callback);
				} else {
					service.textSearch({
						location: theSpot.mapFunctions.map.getCenter(),
						radius: 200,
						query: searchValue
					}, callback);
				}
			}
		},

		/**
		 * Converts the Google Places object to a normalized objec, so the system can read/use it
		 * @method normalizeGoogleRecord
		 * @param  {object} record Google Places object
		 * @return {object}        Normalized object for the system
		 */
		normalizeGoogleRecord: function (record) {
			var newRecord = {
				name: record.name,
				latitude: record.geometry.location.lat(),
				longitude: record.geometry.location.lng(),
				category: record.types
			};
			try { //if (record.formatted_address && record.formatted_address.match(" ")) {
				var addressArray = record.formatted_address.split(", ");
				addressArray = addressArray.reverse();
				var postCodeCity = addressArray[1].split(" ");
				var streetNumber = addressArray[addressArray.length - 1].split(" ");
				newRecord.address = {
					country: addressArray[0],
					postalCode: postCodeCity[0],
					city: postCodeCity[1],
					street: streetNumber[0],
					number: streetNumber[1],
				};
			} catch (er) {}
			if (record.photos) {
				newRecord.image = "url('" + record.photos[0].getUrl({ maxWidth: 500 }) + "')";
			}
			return newRecord;
		},

		/**
		 * Makes a request to Here Places search engine and returns results corresponding to the query
		 * @method searchInHere
		 * @param  {string|array} searchValue Search query of user
		 */
		searchInHere: function (searchValue) {
			if (searchValue && document.querySelector('.searchEngine input[value="here"]').checked) {
				var headers = {
					'Accept': 'application/json'
				};
				var url = 'https://places.cit.api.here.com/places/v1/discover/';
				var data = {
					app_id: 'I9kzY4jddr2S6594deUU',
					app_code: 'owOV8OKda70_eXI6GowYFg',
				};
				if (theSpot.searchPlace.searchType === "coordinates") {
					url += 'here';
					data.at = searchValue[0] + ',' + searchValue[1];
				} else {
					url += 'search';
					data.q = searchValue;
					data.at = theSpot.mapFunctions.centerPoint.lat + ',' + theSpot.mapFunctions.centerPoint.lng;
				}
				theSpot.server.getRequestExternalData(url, data, headers, function (responseObj) {
					var newDataObject = {};
					var results = responseObj.results.items;
					// console.log(responseObj);
					var len = Math.min(theSpot.searchPlace.maxResultsFromAPI, results.length);
					for (var i = 0; i < len; i++) {
						if (results[i].position && results[i].title) {
							newDataObject["here" + i] = theSpot.searchPlace.normalizeHereRecord(results[i]);
						}
					}
					theSpot.searchPlace.populateResultsList(newDataObject);
				});
			}
		},

		/**
		 * Converts the Here Places object to a normalized objec, so the system can read/use it
		 * @method normalizeHereRecord
		 * @param  {object} record Here Places object
		 * @return {object}        Normalized object for the system
		 */
		normalizeHereRecord: function (record) {
			var newRecord = {
				name: record.title,
				latitude: record.position[0],
				longitude: record.position[1],
				category: [record.category]
			};
			if (record.vicinity) {
				var addressArray = record.vicinity.split(/\s|\<br\/\>/gim);
				var street = addressArray.slice(0, addressArray.length - 3).join(" ");
				addressArray = addressArray.reverse();
				newRecord.address = {
					postalCode: addressArray[1],
					city: addressArray[0],
					street: street,
					number: addressArray[2],
				};
			}
			return newRecord;
		},

		/**
		 * Makes a request to Sigyc search engine and returns results corresponding to the query
		 * @method searchInSygic
		 * @param  {string|array} searchValue Search query of user
		 */
		searchInSygic: function (searchValue) {
			if (searchValue && document.querySelector('.searchEngine input[value="sygic"]').checked) {
				var radius = 500;
				var startingPoint = theSpot.mapFunctions.centerPoint;
				var url = 'https://api.sygictravelapi.com/1.0/en/places/list';
				var data = {};

				if (theSpot.searchPlace.searchType === "coordinates") {
					radius = 30;
					data = {
						'area': searchValue[0] + ',' + searchValue[1] + ',' + radius
					};
				} else {
					data = {
						'area': startingPoint.lat + ',' + startingPoint.lng + ',' + radius,
						'query': searchValue
					};
				}
				var headers = {
					'x-api-key': '8G0taIJe8s8xAclYMppcJ33KLfTQ4sIz95oHGFts',
					'Accept': 'application/json'
				};
				theSpot.server.getRequestExternalData(url, data, headers, function (responseObj) {
					console.info(responseObj);
					var newDataObject = {};
					var results = responseObj.data.places;
					var len = Math.min(theSpot.searchPlace.maxResultsFromAPI, results.length);
					for (var i = 0; i < len; i++) {
						if (results[i].name && results[i].location) {
							newDataObject["sygic" + i] = theSpot.searchPlace.normalizeSygicRecord(results[i]);
						}
					}
					theSpot.searchPlace.populateResultsList(newDataObject);
				});
			}
		},

		/**
		 * Converts the Sigyc object to a normalized objec, so the system can read/use it
		 * @method normalizeSygicRecord
		 * @param  {object} record Sigyc object
		 * @return {object}        Normalized object for the system
		 */
		normalizeSygicRecord: function (record) {
			var newRecord = {
				name: record.name,
				latitude: record.location.lat,
				longitude: record.location.lng,
				category: record.categories,
				description: record.perex
			};
			if (record.thumbnail_url) {
				newRecord.image = "url('" + record.thumbnail_url + "')";
			}
			return newRecord;
		},

		/**
		 * Waits for all engines to return resluts and shows them in the search results list
		 * @method populateResultsList
		 * @param  {object} newData Search results (normalized) from search engine
		 */
		populateResultsList: function (newData) {
			Object.assign(theSpot.searchPlace.searchResults, newData);
			theSpot.searchPlace.numReturnedQueries++;
			if (theSpot.searchPlace.numReturnedQueries === theSpot.searchPlace.container.querySelectorAll(".searchEngine input:checked").length) {
				var resultsContainer = theSpot.searchPlace.container.querySelector("ul");
				var places = theSpot.searchPlace.searchResults;
				var placesList = [];
				var image = "";
				var defaultImage = "url('images/noImage.png')";
				for (var pid in places) {
					if (places[pid]) {
						image = places[pid].image || defaultImage;
						placesList.push('<li>');
							placesList.push('<div class="place_image" style="background-image: ' + image + '"></div>');
							placesList.push('<div class="place_info">');
								placesList.push('<span onmousedown="theSpot.searchPlace.sendDataForInfo(\'' + pid + '\')" style="cursor:pointer;">' + places[pid].name + '</span><br/>');
								if (places[pid].category) {
									placesList.push('<span style="font-size: 70%;">' + places[pid].category.join(", ") + '</span><br/>');
								}
								placesList.push('<img src="' + theSpot.searchPlace.getApiLogo(pid) + '"/>');
							placesList.push('</div>');
							placesList.push('<div class="place_description">');
							if (places[pid].description) {
								placesList.push(places[pid].description);
							}
							placesList.push('</div>');
							placesList.push('<div class="place_tools">');
								placesList.push('<div class="add" title="Add place to personal list" onmousedown="theSpot.searchPlace.addHandler(\'' + pid + '\')"></div>');
							placesList.push('</div>');
						placesList.push('</li>');
					}
				}
				resultsContainer.innerHTML = placesList.join('');
				theSpot.mapFunctions.addMarkersToMap(places);
				theSpot.navigation.toggleLoadingVisibility(false);
			}
		},

		/**
		 * Depending on the record ID, returns a API (search engine) logo
		 * @method getApiLogo
		 * @param  {string} recordID ID of API
		 * @return {string}          Path to image
		 */
		getApiLogo: function (recordID) {
			var logo = null;
			switch (true) {
				case (recordID.indexOf("google") > -1):
					logo = "images/google.png";
					break;
				case (recordID.indexOf("here") > -1):
					logo = "images/here.png";
					break;
				case (recordID.indexOf("sygic") > -1):
					logo = "images/sygic.png";
					break;
				default:
					logo = "images/transperantPixel.png";
					break;
			}
			return logo;
		},

		/**
		 * Opens a selected record from the search results list in the editPlace interface
		 * @method addHandler
		 * @param {string} placeID ID of the record
		 */
		addHandler: function (placeID) {
			theSpot.editPlace.setPlaceForEdit(theSpot.searchPlace.searchResults[placeID], "");
			theSpot.navigation.openView('editPlace');
		},

		/**
		 * Creates an information window for the map
		 * @method sendDataForInfo
		 * @param  {string} id ID of record
		 */
		sendDataForInfo: function (id) {
			var content = [];
			var infoObj = theSpot.searchPlace.searchResults[id];
			content.push('<div class="infoWindowTitle">' + infoObj.name + '</div>');
			content.push('<div class="infoWindowContent"><span class="propertySpan">Coordinates: </span><span>' + infoObj.latitude + ', ' + infoObj.longitude + '</span></div>');
			if (infoObj.address) {
				var addressString = (infoObj.address.street ? infoObj.address.street : "");
				addressString += " " + (infoObj.address.number ? infoObj.address.number : "");
				addressString += ", " + (infoObj.address.postalCode ? infoObj.address.postalCode : "");
				addressString += " " + (infoObj.address.city ? infoObj.address.city : "");
				addressString += " " + (infoObj.address.country ? infoObj.address.country : "");
				content.push('<div class="infoWindowContent"><span class="propertySpan">Address: </span><span>' + addressString + '</span></div>');
			}
			if (infoObj.website) {
				content.push('<div class="infoWindowContent"><span class="propertySpan">Website:</span><span><a href="http://' + infoObj.website + '" target="_blank">' + infoObj.website + '<a/></span></div>');
			}
			if (infoObj.phone) {
				content.push('<div class="infoWindowContent"><span class="propertySpan">Phone:</span><span>' + infoObj.phone + '</span></div>');
			}
			theSpot.mapFunctions.showInfoWindow(id, content.join(''));
		},

		/**
		 * Listens for pressing the Enter key to call the searchHandler function
		 * @method keyPressHandler
		 * @param  {integer} keyCode Code of the currently pressed key
		 */
		keyPressHandler: function (keyCode) {
			if (keyCode === 13) {
				theSpot.searchPlace.searchHandler();
			}
		}
	},

	profile: {
		container: document.getElementsByClassName("leftViewContainer profile")[0],

		/**
		 * Renders the profile user interface
		 * @method init
		 */
		init: function () {
			theSpot.mapFunctions.clearAllMarkers()
			var reqParams = {
				type: "getUserDocument",
				data: {
					_id: theSpot.userData.id,
				}
			};
			theSpot.server.requestDataFromTheSpot(reqParams, function(data) {
				theSpot.userData.password = data.password;
				var fields = {};
				var html = [];
				html.push('<div class="buttonsCont"><div class="defaultButton" onmousedown="theSpot.navigation.openView(\'myPlaces\')">Cancel</div>');
				html.push('<div class="defaultButton" style="float: right;" onmousedown="theSpot.profile.toggleEditSave(this)">Edit</div></div>');
				html.push('<div class="propertyContainer">');
				html.push('<span class="defaultLabel">First name</span><br/>');
				html.push('<input class="defaultInput" value="' + data.firstName + '" type="text" disabled="disabled" name="firstName"/>');
				html.push('</div>');
				
				html.push('<div class="propertyContainer">');
				html.push('<span class="defaultLabel">Last name</span><br/>');
				html.push('<input class="defaultInput" value="' + data.lastName + '" type="text" disabled="disabled" name="lastName"/>');
				html.push('</div>');
				
				html.push('<div class="propertyContainer" style="display: none;">');
				html.push('<span class="defaultLabel">e-mail</span><br/>');
				html.push('<input class="defaultInput" value="' + data.mail + '" type="email" disabled="disabled" name="mail"/>');
				html.push('</div>');
				
				html.push('<div class="propertyContainer">');
				html.push('<span class="defaultLabel" style="margin-bottom: 0px;">Birthdate</span><br/>');
				html.push('<span class="defaultLabel" style="margin-top: 0px; font-size: 70%;">/year-month-day/</span><br/>');
				var date = data.birthdate.year + "-" + (data.birthdate.month < 10 ? "0" + data.birthdate.month : data.birthdate.month) + "-" + (data.birthdate.day < 10 ? "0" + data.birthdate.day : data.birthdate.day);
				html.push('<input class="defaultInput" value="' + date + '" type="date" disabled="disabled" name="birthdate"/>');
				html.push('</div>');
				
				html.push('<div class="propertyContainer">');
				html.push('<span class="defaultLabel">Password</span><br/>');
				html.push('<input class="defaultInput" type="password" value="' + data.password + '" disabled="disabled" name="password"/>');
				html.push('</div>');
				theSpot.profile.container.innerHTML =  html.join('');
				theSpot.navigation.toggleLoadingVisibility(false);
			});
		},

		/**
		 * Depending on the text inside the button, the function enables all input fields for edit or sends the newly inputed information to the server and disables the inputs again
		 * @method toggleEditSave
		 * @param  {HTMLElement} button Edit/Save button
		 */
		toggleEditSave: function (button) {
			var inputs = theSpot.profile.container.querySelectorAll("input");
			if (button.innerText.toLowerCase() === "edit") {
				button.innerText = "save";
				inputs.forEach(function (inp) {
					inp.removeAttribute("disabled");
				});
			} else {
				if (theSpot.utils.validateInputs(inputs)) {
					var pass2 = prompt("Please reenter your old password!");
					if (pass2 === theSpot.userData.password) {
						var date = [];
						var reqParams = {
							type: "editUser",
							data: {
								_id: theSpot.userData.id
							}
						};
						inputs.forEach(function (inp) {
							if (inp.name === "birthdate") {
								date = inp.value.split("-");
								reqParams.data.birthdate = {
									year: parseInt(date[0], 10),
									month: parseInt(date[1], 10),
									day: parseInt(date[2], 10)
								}
							} else {
								reqParams.data[inp.name] = inp.value;
							}
						});
						theSpot.server.requestDataFromTheSpot(reqParams, function(data) {
							theSpot.userData.password = reqParams.data.password;
							button.innerText = "edit";
							inputs.forEach(function (inp) {
								inp.setAttribute("disabled", "disabled");
							});
						});
					} else {
						if (pass2 !== null) {
							alert("The password did not match!");
						}
					}
				}
			}
		}
	},

	editPlace: {
		container: document.getElementsByClassName("leftViewContainer editPlace")[0],
		placeForEdit: null,

		/**
		 * Renders the editPlace user interface
		 * @method init
		 */
		init: function () {
			if (!theSpot.editPlace.placeForEdit) {
				theSpot.editPlace.setPlaceForEdit();
			}
			var place = theSpot.editPlace.placeForEdit;
			var imageSrc = place.image || "url('images/noImage.png')";
			var html = [];
			html.push('<div class="buttonsCont"><div class="defaultButton" onmousedown="theSpot.navigation.openView(\'myPlaces\')">Cancel</div>');
			html.push('<div class="defaultButton alertBackground" style="margin-left: 1em;" onmousedown="theSpot.editPlace.deleteHandler()">Delete</div>');
			html.push('<div class="defaultButton" style="float: right;" onmousedown="theSpot.editPlace.saveHandler()">Save</div></div>');
			
			html.push('<div class="propertyContainer"><table><tbody>');
			html.push('<tr><th colspan="2"><span class="defaultLabel header">Basic information</span></th></tr>');
			html.push('<tr><td><span class="defaultLabel">Name</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.name + '" type="text" name="name"/></td></tr>');
			
			html.push('<tr title="You can add multiple categories by separating them with commas (,)"><td><span class="defaultLabel">Category</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.category.join(", ") + '" type="text" name="category"/></td></tr>');

			html.push('<tr><td><span class="defaultLabel">Description</span></td>');
			html.push('<td><textarea class="defaultTextArea" type="text" name="description">' + place.description + '</textarea></td></tr>');
			// html.push('<td><input class="defaultInput" value="' + place.description + '" type="text" name="description"/></td></tr>');
			html.push('</tbody></table></div>');

			html.push('<div class="propertyContainer">');
			html.push('<div class="defaultLabel header">Image</div>');
			html.push('<input type="file" onchange="theSpot.editPlace.imgToBase64Converter(this)" name="image" hidden/>');
			html.push('<div class="editableImage" onmousedown="theSpot.editPlace.openFileExplorer(this)" style="background-image: ' + imageSrc + '" title="Click to change image"></div>');
			html.push('</div>');

			html.push('<div class="propertyContainer"><table><tbody></td>');
			html.push('<tr><th colspan="2"><span class="defaultLabel header">Coordinates</span></th></tr>');
			html.push('<tr><td><span class="defaultLabel">Latitude</span>');
			html.push('<td><input class="defaultInput" value="' + place.latitude + '" type="number" step="0.000001" name="latitude"/></td></tr>');

			html.push('<tr><td><span class="defaultLabel">Longitude</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.longitude + '" type="number" step="0.000001" name="longitude"/></td></tr>');
			html.push('</tbody></table></div>');

			html.push('<div class="propertyContainer"><table><tbody>');
			html.push('<tr><th colspan="2"><span class="defaultLabel header">Address</span></th></tr>');
			html.push('<tr><td><span class="defaultLabel">Country</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.address.country + '" type="text" name="country"/></td></tr>');
			
			html.push('<tr><td><span class="defaultLabel">City</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.address.city + '" type="text" name="city"/></td></tr>');

			html.push('<tr><td><span class="defaultLabel">Street</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.address.street + '" type="text" name="street"/></td></tr>');

			html.push('<tr><td><span class="defaultLabel">Number</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.address.number + '" type="text" name="number"/></td></tr>');

			html.push('<tr><td><span class="defaultLabel">Postal code</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.address.postalCode + '" type="text" name="postalCode"/></td></tr>');
			html.push('</tbody></table></div>');

			html.push('<div class="propertyContainer"><table><tbody>');
			html.push('<tr><th colspan="2"><span class="defaultLabel header">Contacts</span></th></tr>');
			html.push('<tr><td><span class="defaultLabel">Phone</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.phone + '" type="tel" name="phone"/></td></tr>');

			html.push('<tr><td><span class="defaultLabel">Website</span></td>');
			html.push('<td><input class="defaultInput" value="' + place.website + '" type="url" name="website"/></td></tr>');
			html.push('</tbody></table></div>');
			theSpot.editPlace.container.innerHTML = html.join('');
			if (place.latitude !== "" && place.longitude !== "") {	
				var temp = {};
				temp[place.id] = place;
				theSpot.mapFunctions.addMarkersToMap(temp);
			}
			theSpot.navigation.toggleLoadingVisibility(false);
		},

		/**
		 * Adds the information of the record to the corresponding fields in the interface
		 * @method setPlaceForEdit
		 * @param {object} placeObj record
		 * @param {string} placeID  ID of the record
		 */
		setPlaceForEdit: function (placeObj, placeID) {
			var tempObject = {
				id: "",
				name: "",
				image: null,
				latitude: "",
				longitude: "",
				address: {
					street: "",
					number: "",
					city: "",
					postalCode: "",
					country: ""
				},
				description: "",
				category: [],
				website: "",
				phone: ""
			};
			if (placeObj) {
				for (var prop in placeObj) {
					if (prop === "address") {
						tempObject["address"] = {
							street: placeObj[prop].street || "",
							number: placeObj[prop].number || "",
							city: placeObj[prop].city || "",
							postalCode: placeObj[prop].postalCode || "",
							country: placeObj[prop].country || ""
						};
					} else {
						tempObject[prop] = placeObj[prop];
					}
				}
				tempObject.id = placeID;
			}

			theSpot.editPlace.placeForEdit = tempObject;
		},

		/**
		 * Checks all input fields and returns a normalized object. A message is diplayed if an error occurs
		 * @method gatherData
		 * @return {object} Normalized record
		 */
		gatherData: function () {
			var allCorrectData = {};
			var inputs = theSpot.editPlace.container.querySelectorAll("input");
			var textAreaVal = theSpot.editPlace.container.querySelector("textarea").value;
			var imageSource = theSpot.editPlace.container.querySelector(".editableImage").style.backgroundImage;
			if (theSpot.utils.validateInputs(inputs)) {
				var inputsLen = inputs.length;
				var name = "";
				var val = "";
				var emptyFieldsFlag = false;
				for (var i = 0; i < inputsLen; i++) {
					name = inputs[i].name;
					val = inputs[i].value;
					if (!val || val === "") {
						emptyFieldsFlag = true;
					} else {
						if (name.match(/city|street|number|postalCode|country/)) {
							if (typeof allCorrectData.address === "undefined") {
								allCorrectData.address = {};
							}
							allCorrectData.address[name] = val;
						} else {
							allCorrectData[name] = val;
						}
					}
				}
				if (textAreaVal !== "") {
					allCorrectData.description = textAreaVal;
				}
				if (!imageSource.match("noImage.png")) {
					allCorrectData.image = imageSource.replace(/\"/gim, "'");
				}
				allCorrectData.latitude = theSpot.utils.cutCoordinatesTo6(allCorrectData.latitude);
				allCorrectData.longitude = theSpot.utils.cutCoordinatesTo6(allCorrectData.longitude);
				if (allCorrectData.category) {
					allCorrectData.category = allCorrectData.category.split(/,\s|,/);
				}
				if (emptyFieldsFlag || textAreaVal === "") {
					var confirmation = confirm('There are empty fields, the data will be saved as it is! Continue?');
					if (confirmation) {
						return allCorrectData;
					} else {
						return null;
					}
				} else {
					return allCorrectData;
				}
			} else {
				return null;
			}
		},

		/**
		 * Sends a request to the server to (re)save the new record
		 * @method saveHandler
		 * @param  {[type]} placeID ID of the record
		 */
		saveHandler: function (placeID) {
			var formData = theSpot.editPlace.gatherData();
			if (formData) {
				theSpot.navigation.toggleLoadingVisibility(true);
				var reqParams = {};
				if (theSpot.editPlace.placeForEdit.id === "") {
					reqParams = {
						type: "addPlaceToUserDoc",
						data: {
							_id: theSpot.userData.id,
							placeData: formData
						}
					};
				} else {
					reqParams = {
						type: "editPlaceInUserDoc",
						data: {
							_id: theSpot.userData.id,
							placeID: theSpot.editPlace.placeForEdit.id,
							isDelete: false,
							newPlaceData: formData
						}
					};
				}
				theSpot.server.requestDataFromTheSpot(reqParams, function(success) {
					if (success) {
						alert("Save successful!");
						theSpot.navigation.openView('myPlaces');
					} else {
						alert("Save unsuccessful: something went wrong! Please try again!");
					}
				});
			}
		},

		/**
		 * Opens the file explorer to upload an image
		 * @method openFileExplorer
		 * @param  {HTMLElement} editableImage Clicked-on element
		 */
		openFileExplorer: function (editableImage) {
			var fileInput = editableImage.parentNode.querySelector("input");
			fileInput.click();
		},

		/**
		 * Converts the uploaded image to an base64 string
		 * @method imgToBase64Converter
		 * @param  {object} fileInput Uploaded file
		 */
		imgToBase64Converter: function (fileInput) {
			var file = fileInput.files[0];
			var reader = new FileReader();
			var editableImage = fileInput.parentNode.querySelector(".editableImage");

			reader.addEventListener("load", function () {
				editableImage.style.backgroundImage = "url('" + reader.result + "')";
			}, false);

			if (file) {
				reader.readAsDataURL(file);
			}
		},

		/**
		 * Asks the user to reenter his password for confirmation and deletes the edited record
		 * @method deleteHandler
		 */
		deleteHandler: function () {
			var confirmation = prompt('Please enter your password to delete "' + theSpot.editPlace.placeForEdit.name + '"!');
			if (confirmation === theSpot.userData.password) {
				theSpot.navigation.toggleLoadingVisibility(true);
				var reqParams = {
					type: "editPlaceInUserDoc",
					data: {
						_id: theSpot.userData.id,
						placeID: theSpot.editPlace.placeForEdit.id,
						isDelete: true
					}
				};
				theSpot.server.requestDataFromTheSpot(reqParams, function(success) {
					if (success) {
						alert("Delete successful!");
						theSpot.navigation.openView('myPlaces');
					} else {
						alert("Delete unsuccessful: something went wrong! Please try again!");
					}
				});
			} else {
				if (confirmation !== null) {
					alert("Delete unsuccessful: incorrect password!");
				}
			}
		}
	},

	mapFunctions: {
		map: null,
		infoWindow: null,
		markers: {},
		centerPoint: {
			lat: 48.205212,
			lng: 16.375031
		},

		/**
		 * Renders the map user interface
		 * @method init
		 */
		init: function () {
			var mapCont = document.querySelector(".mapContainer");
			var map = new google.maps.Map(mapCont, {
				styles: mapStyles,
				center: { "lat": 48.205211, "lng": 16.375029 },
				zoom: 16
			});
			theSpot.mapFunctions.map = map;
		},

		/**
		 * Centers the map over a point
		 * @param  {double} latitude  Latitude of the point
		 * @param  {double} longitude Longitude of the point
		 */
		centerOverPlace: function (latitude, longitude) {
			theSpot.mapFunctions.map.setCenter(new google.maps.LatLng(latitude, longitude));
			theSpot.mapFunctions.map.setZoom(12);
		},

		/**
		 * Displays a information window over a marker
		 * @method showInfoWindow
		 * @param  {string} id   ID of marker
		 * @param  {string} info Content of window
		 */
		showInfoWindow: function (id, info) {
			if (theSpot.mapFunctions.infowindow) {
				theSpot.mapFunctions.infowindow.close();
				theSpot.mapFunctions.infowindow = null;
			}
			theSpot.mapFunctions.infowindow = new google.maps.InfoWindow({
				content: info
			});
			google.maps.event.addListener(theSpot.mapFunctions.infowindow,'closeclick',function(){
				theSpot.mapFunctions.infowindow = null;
			});
			theSpot.mapFunctions.infowindow.open(theSpot.mapFunctions.map, theSpot.mapFunctions.markers[id]);
		},

		/**
		 * Adds markers to the map
		 * @method addMarkersToMap
		 * @param {object} places Records to display on map
		 */
		addMarkersToMap: function (places) {
			if (theSpot.mapFunctions.map && Object.keys(theSpot.mapFunctions.markers).length > 0) {
				theSpot.mapFunctions.clearAllMarkers();
			}
			var temp = Object.keys(places)[0];
			if (temp) {
				var minMaxObj = {
					maxLat: places[temp].latitude,
					minLat: places[temp].latitude,
					maxLng: places[temp].longitude,
					minLng: places[temp].longitude
				};
				var curLat = 0;
				var curLng = 0;
				for (var i in places) {
					if (places[i]) {
						curLat = places[i].latitude;
						curLng = places[i].longitude;

						if (minMaxObj.maxLat < curLat) {
							minMaxObj.maxLat = curLat;
						}
						if (minMaxObj.minLat > curLat) {
							minMaxObj.minLat = curLat;
						}
						if (minMaxObj.maxLng < curLng) {
							minMaxObj.maxLng = curLng;
						}
						if (minMaxObj.minLng > curLng) {
							minMaxObj.minLng = curLng;
						}
						theSpot.mapFunctions.markers[i] = new google.maps.Marker({
							position: new google.maps.LatLng(curLat, curLng),
							map: theSpot.mapFunctions.map,
							title: places[i].name,
						});
					}
				}
				theSpot.mapFunctions.centerPoint = {
					lat: theSpot.utils.cutCoordinatesTo6(minMaxObj.minLat + ((minMaxObj.maxLat - minMaxObj.minLat) / 2)),
					lng: theSpot.utils.cutCoordinatesTo6(minMaxObj.minLng + ((minMaxObj.maxLng - minMaxObj.minLng) / 2))
				};
				if (minMaxObj.maxLat == minMaxObj.minLat && minMaxObj.maxLng == minMaxObj.minLng) {
					theSpot.mapFunctions.centerOverPlace(minMaxObj.minLat, minMaxObj.minLng);
				} else {
					theSpot.mapFunctions.map.setZoom(theSpot.mapFunctions.calculateZoom(minMaxObj));
					theSpot.mapFunctions.map.setCenter(theSpot.mapFunctions.centerPoint);
				}
			}
		},

		/**
		 * Removes all markers from the map
		 * @method clearAllMarkers
		 */
		clearAllMarkers: function () {
			for (var i in theSpot.mapFunctions.markers) {
				theSpot.mapFunctions.markers[i].setMap(null);
			}
			theSpot.mapFunctions.markers = {};
		},

		/**
		 * Calculates the zoom of the map, depending on the number of records and the distance between them
		 * method calculateZoom
		 * @param  {object} minMaxObj 	Contains the minimums and maximums of the latitude the longitude
		 * @return {integer}           	Number for zoom
		 */
		calculateZoom: function (minMaxObj) {
			var diffLat = minMaxObj.maxLat - minMaxObj.minLat;
			var diffLng = minMaxObj.maxLng - minMaxObj.minLng;
			var zoom = 16 - parseInt(Math.min(diffLat, diffLng) * 100, 10);
			if (zoom < 3) {
				zoom = 3;
			}
			// console.log(minMaxObj, zoom);
			return zoom;
		}
	},

	server: {
		theSpotAddress: "http://127.0.0.1:1992/",

		/**
		 * Makes requests to theSpot server for acquiring information
		 * method requestDataFromTheSpot
		 * @param  {object}   params   Parameters for the request
		 * @param  {function} callback Callback function to execute on response
		 */
		requestDataFromTheSpot: function (params, callback) {
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status == 200) {
						// console.log(JSON.parse(xmlhttp.response));
						callback(JSON.parse(xmlhttp.response));
					} else {
						console.error("Server is not responding!");
						alert("Server is not responding, please try againg later!");
					}
				}
			}
			xmlhttp.open("POST", theSpot.server.theSpotAddress, true);
			// xmlhttp.setRequestHeader("Content-Type", "application/json");
			xmlhttp.send(JSON.stringify(params));
		},

		/**
		 * Makes requests to different servers for acquiring information
		 * @method getRequestExternalData
		 * @param  {string}   url      Address to send the request to
		 * @param  {object}   data     Data to be transmited
		 * @param  {object}   headers  Metadata for the headers of the request
		 * @param  {function} callback Callback function to execute on response
		 */
		getRequestExternalData: function (url, data, headers, callback) {
			var urlParams = [];
			for (var item in data) {
				urlParams.push(item + "=" + data[item]);
			}
			url += '?' + urlParams.join("&");
			// console.log(url);

			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status == 200) {
						callback(JSON.parse(xmlhttp.response));
					} else {
						console.error("Error sending GET request!");
					}
				}
			}
			xmlhttp.open("GET", url, true);
			if (headers) {
				for (var h in headers) {
					xmlhttp.setRequestHeader(h, headers[h]);
				}
			}
			xmlhttp.send();
		}
	},

	utils: {
		/**
		 * Validates an array of inputs, depending on their type
		 * @method validateInputs
		 * @param  {array} inputs 	Array of inputs
		 * @return {boolean}        Returns true if all inputs are correctly filled, else false
		 */
		validateInputs: function (inputs) {
			var inputsLen = inputs.length;
			var isValidetionFalse = function (type, inpVal) {
				var check = false;
				switch (type) {
					case "firstName":
					case "lastName":
					case "password":
					case "birthdate":
					case "name":
						check = (inpVal !== "");
						break;
					case "mail":
						var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						check = (inpVal !== "" && re.test(inpVal));
						break;
					case "latitude":
					case "longitude":
						var re = /([+-]?\d+\.?\d+)/;
						check = (inpVal !== "" && re.test(inpVal));
						break;
					/*case "category":
					case "description":
					case "image":
					case "street":
					case "city":
					case "number":
					case "postalCode":
					case "country":
					case "phone":
					case "website":*/
					default:
						check = true;
						break;
				}
				return !check;
			};

			for (var i = 0; i < inputsLen; i++) {
				var name = inputs[i].name;
				var val = inputs[i].value;
				if (isValidetionFalse(name, val)) {
					alert("The " + name + " is not correctly filled!");
					return false;
				}
			}
			return true;
		},

		/**
		 * Cuts the coordinte string to 6 number after the decimal point
		 * @method cutCoordinatesTo6
		 * @param  {float} coord Long coordinates
		 * @return {float}       Reduced coordinate
		 */
		cutCoordinatesTo6: function (coord) {
			return parseFloat(parseFloat(coord).toFixed(6));
		}
	}
};

/*
Test strings for search:
bar
37.7942,-122.4070 - San Francisco
place to have beer
Wien, Garnisongasse 14
 */