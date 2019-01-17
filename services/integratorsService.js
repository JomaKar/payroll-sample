var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';


app.factory('integratorsService', ['$http', 'userService', function($http, userService){
	var service = {
		integrators: [],
		areIntegrators: false,
		fetch: function(theData){
			var selfObj = this,
				usrID = userService.getUserID();

			var url = contextUrl + 'src/json/integrators.json';
			// var url = contextUrl + '/integradores/' + theData.pocId;

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": usrID
			};

			$http
			.get(url, headers)
			.success(function(res){
				(res.responseCode.status == 200) ? selfObj.set(res.data, theData.pocId) : alert(res.responseCode.descripcion);
			});

		},
		get: function(){
			return angular.copy(this.integrators);
		},
		set: function(elems, pocId){
			elems.forEach(function(el){ el.pocId = pocId});
			this.integrators = elems;
			this.areIntegrators = true;
		},
		areElements: function(thePocID){
			var randomIntegratorIdx = Math.floor(Math.random() * Math.floor(this.integrators.length))
			return (this.areIntegrators && this.integrators[randomIntegratorIdx].pocId == thePocID) ? true : false;
		},
		sendMessage: function(integradorId, message){
			console.log(integradorId, message);
		}
	};

	return service;

}]);