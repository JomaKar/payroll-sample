var app = angular.module('PayRollWebApp');


app.factory('locationService', ['$timeout', '$window', '$q', function ($timeout, $window, $q) {
	var service = {
		location: [],
		map: undefined,
		loadGoogleMaps: function(){
				return this.loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBSpwHWVvmJJLbyjhReDbryGXhvDJkY6Fs", function () {
					return typeof $window.google !== 'undefined'
				}, "Google Maps");
		},
		loadScript: function(scriptSrc, scriptLoadedCheck, name){
			var script = document.createElement("script");        
			script.src = scriptSrc;
			document.getElementsByTagName("head")[0].appendChild(script);

			return this.poll(scriptLoadedCheck, null, null, name);
		},
		poll: function(whenReady, interval, timeout, name){
			// console.log("Estas en poll");
			var deferred = $q.defer(),
			i = parseInt(interval, 10) || 50, 
			t = parseInt(timeout, 10) || 10000;
 
			(function poll() {
					var me = this;
					if (whenReady.apply(me)) {
							deferred.resolve();
					} else if ((t -= i) > 0) {
							deferred.notify("Polling " + (name || ""))
							$timeout(poll, i);
					} else {
							deferred.reject("Poll timeout reached " + (name || ""));
					}
			}());

			return deferred.promise;
		},
		startMap: function(){
			// console.log(google);
			definePopupClass();
			this.map = new google.maps.Map(document.getElementById('contentLocationMap'), {
	          center: {lat: 19.294109, lng: -99.666233},
	          zoom: 6
	        });
		},
		setLocations: function (places){
			// suppose to be an array
			this.location = places;
		},
		getLocations: function(){
			return this.location;
		},
		locationAddressName: function(locationData){
			var geocoder = new google.maps.Geocoder;
			var latlng = {lat: locationData.latitude, lng: locationData.longitude};

			geocoder.geocode({'location': latlng}, function(results, status) {
				// console.log('this are the results', results, status);
				if (status === 'OK') {
				  if (results[0]) {
				   	locationData.addressName = (results[0].formatted_address !== undefined) ? results[0].formatted_address : 'ningún lado';
				   	// console.log('thatsTheAddredss', locationData.addressName);
				  } else if(results == null) {
				    locationData.addressName = 'ningún lugar';
				  }
				} else {
				  // console.log('Geocoder failed due to: ' + status);
				  locationData.addressName = 'ningún lugar';
				}
			});

		},
		showLocations: function(startingCenter, caseType, markerExtraInfo){

			

			var startingCenter = (startingCenter) ? startingCenter : {lat: 19.3403378, lng: -99.5743036};
	        var map = this.map;
	        var selfObject = this;

	        var body = document.getElementsByTagName('body')[0];

	        if(!markerExtraInfo){
	        	var pastMarkers = Array.from(document.getElementsByClassName('marker-element'));
		        
		        if(pastMarkers.length > 0){
		        	pastMarkers.map(function(elem, i){
		        		elem.parentNode.removeChild(elem);
		        	});
		        }
	        }

			if(caseType == 'simpleMarker'){
				map.setZoom(12);
	        	map.setCenter(startingCenter);

				this.location.map(function(loc, i){

		        	var infoInMarker = {image: loc.profileImg, markerId: loc.userId};
			        var createdDiv = selfObject.createElement(caseType, infoInMarker, null);

				    body.appendChild(createdDiv);

				    var eachPopup = new Popup(new google.maps.LatLng(loc.latitude, loc.longitude), document.getElementById('content-'+ loc.userId), infoInMarker.markerId);

				    eachPopup.setMap(map);

		        });

			}else{

				if(markerExtraInfo){
					map.setZoom(12);
	        		map.setCenter({lat: markerExtraInfo.latitude, lng: markerExtraInfo.longitude});

					var infoInMarker = {markerId: markerExtraInfo.userId , image: markerExtraInfo.profileImg, addressText: markerExtraInfo.addressName};
					var createdDiv = selfObject.createElement(caseType, infoInMarker, true);
					body.appendChild(createdDiv);
					var actualPopup = new Popup(new google.maps.LatLng(markerExtraInfo.latitude, markerExtraInfo.longitude), document.getElementById('content-'+infoInMarker.markerId), infoInMarker.markerId);
					actualPopup.setMap(map);

				}

				this.location.map(function(loc, i){

					var infoInMarker = {markerId: loc.locationId, timeTxt: loc.timeTxt, addressText: loc.addressName, idx: i};
					// console.log(infoInMarker, 'lastLocations');
			        var createdDiv = selfObject.createElement(caseType, infoInMarker, false);

				    body.appendChild(createdDiv);

				    var eachPopup = new Popup(new google.maps.LatLng(loc.latitude, loc.longitude), document.getElementById('content-'+infoInMarker.markerId), infoInMarker.markerId);

				    eachPopup.setMap(map);

		        });
			}
		},
		showSimplestLocation: function(){
	        var map = this.map;
	        var selfObject = this;

	        map.setZoom(15);
	        var body = document.getElementsByTagName('body')[0];

	        var pastMarkers = Array.from(document.getElementsByClassName('marker-element'));
	        
	        if(pastMarkers.length > 0){
	        	pastMarkers.map(function(elem, i){
	        		elem.parentNode.removeChild(elem);
	        	});
	        }

	        this.location.map(function(loc, i){

	        	var infoInMarker = {markerId: loc.markerId};
		        var createdDiv = selfObject.createElement('simplestMarker', infoInMarker, null);
		        map.setCenter({lat:loc.latitude, lng:loc.longitude});

		        // console.log('afterCreating', createdDiv);

			    body.appendChild(createdDiv);

			    var eachPopup = new Popup(new google.maps.LatLng(loc.latitude, loc.longitude), document.getElementById('content-'+ infoInMarker.markerId), infoInMarker.markerId);

			    eachPopup.setMap(map);

	        });


		},
		createElement: function(contentType, markerInfo, actualLocation){
			var maindDiv = document.createElement('div');
			maindDiv.setAttribute('id', 'content-' + markerInfo.markerId);
			(actualLocation) ? (maindDiv.classList.add(contentType), maindDiv.classList.add('active')) : maindDiv.classList.add(contentType);

			if(contentType == 'simpleMarker'){
				maindDiv.innerHTML = '<div class="image-container image-background-model marker-number-'+ markerInfo.markerId +'"><span class="imgSpan image-background-model" style="background-image: url('+ markerInfo.image +')"></span></div>';
			}else if(contentType == 'simplestMarker'){
				maindDiv.innerHTML = '<div class="image-container image-background-model marker-number-'+ markerInfo.markerId +'"></div>';
			}else if(contentType == 'complexMarker'){
				maindDiv.innerHTML = (actualLocation) ? 
										'<div class="image-container image-background-model img-label marker-number-'+ markerInfo.markerId +'"><span class="imgSpan image-background-model" style="background-image: url('+ markerInfo.image +')"></span></div><div class="info-container"><p class="time-text">UBICACIÓN ACTUAL</p><p class="place-name-text">'+ markerInfo.addressText +'</p></div>' 
										: 
										'<div class="image-container image-background-model text-label marker-number-'+ markerInfo.markerId +'"><span class="textSpan"> '+ (markerInfo.idx + 1) +' </span></div><div class="info-container"><p class="time-text">'+ markerInfo.timeTxt +'</p><p class="place-name-text">'+ markerInfo.addressText +'</p></div>';
			}
			// one simple marker without text but being able to change self color
			// console.log('onCreating', maindDiv);
			return maindDiv;

		},
		centerOnSomething: function(location){
			var map = this.map;
			map.setZoom(16);
	        map.setCenter({lat: location.latitude, lng: location.longitude});
		}
	};

	return service;

}]);


/** Defines the Popup class. */
function definePopupClass() {
  /**
   * A customized popup on the map.
   * @param {!google.maps.LatLng} position
   * @param {!Element} content
   * @constructor
   * @extends {google.maps.OverlayView}
   */
  Popup = function(position, content, markerID) {
  	// console.log('onImplementing', content, markerID);
    this.position = position;

    var pixelOffset = document.createElement('div');
    pixelOffset.classList.add('popup-bubble-anchor');
    pixelOffset.appendChild(content);

    this.anchor = document.createElement('div');
    this.anchor.classList.add('popup-tip-anchor');
    this.anchor.classList.add('marker-element');
    this.anchor.appendChild(pixelOffset);



    this.anchor.addEventListener("click", function(event) {
		google.maps.event.trigger(self, "click");

		if(!content.classList.contains('simplestMarker')){
			var itmOnList = (content.classList.contains('simpleMarker')) ? document.getElementsByClassName('marker-attached-' + markerID) : document.getElementsByClassName('complex-marker-attached-' + markerID);
			
			var siblings = (content.classList.contains('simpleMarker')) ? Array.from(document.getElementsByClassName('simpleMarker')) : Array.from(document.getElementsByClassName('complexMarker'));
			var itmOnListSiblings = (content.classList.contains('simpleMarker')) ? Array.from(document.getElementsByClassName('agent-itm')) : Array.from(document.getElementsByClassName('location-itm'));

			siblings.forEach(function(e, i){
				e.classList.remove('active');
			});

			itmOnListSiblings.forEach(function(e, i){
				e.classList.remove('active');
			});

			content.classList.add('active');
			angular.element(itmOnList).triggerHandler('click');
		}
    });

    this.stopEventPropagation();
  };
  // NOTE: google.maps.OverlayView is only defined once the Maps API has
  // loaded. That is why Popup is defined inside initMap().
  Popup.prototype = Object.create(google.maps.OverlayView.prototype);

  /** Called when the popup is added to the map. */
  Popup.prototype.onAdd = function() {
    this.getPanes().floatPane.appendChild(this.anchor);
  };

  /** Called when the popup is removed from the map. */
  Popup.prototype.onRemove = function() {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor);
    }
  };

  /** Called when the popup needs to draw itself. */
  Popup.prototype.draw = function() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
    // Hide the popup when it is far out of view.
    var display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px';
      this.anchor.style.top = divPosition.y + 'px';
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display;
    }
  };

  /** Stops clicks/drags from bubbling up to the map. */
  Popup.prototype.stopEventPropagation = function() {
    var anchor = this.anchor;
    anchor.style.cursor = 'auto';

    ['click', 'dblclick', 'contextmenu', 'mousedown', 'touchstart',
     'pointerdown']
        .forEach(function(event) {
          anchor.addEventListener(event, function(e) {
            e.stopPropagation();
          });
        });
  };
}