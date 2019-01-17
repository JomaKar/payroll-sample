var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';


app.factory('geographicElementsService', ['$http', 'userService', function($http, userService){
	var service = {
		statesAvailable: [],
		areStatesAvailable: false,
		municipios: [],
		areMunicipios: false,
		endpoints: {
			statesAvailable: 'src/json/estados.json',
			statesAvailableProd: '/estados',
			municipios: 'src/json/municipios.json',
			municipiosProd: '/town/'
		},
		fetch: function(target, theData){
			var selfObj = this,
				url = contextUrl + this.endpoints[target]; //url development
				// url = (target == 'statesAvailable') ? contextUrl + this.endpoints[target + 'Prod'] : contextUrl + this.endpoints[target + 'Prod'] + theData; //url prod

			var headers = {
					"Content-type": "application/json",
					"X-HSBC-User-Id": userService.getUserToken(),
					"X-HSBC-User-Token": userService.getUserID()
				};
				
				$http
					.get(url, headers)
					.success(function(res){
						if(res.responseCode.status == 200){
							if(target == 'municipios'){
								res.data.forEach(function(mun){
									mun.estado = theData;
								});
							}

							selfObj.set(target, res.data);
						}
				});
		},
		get: function(target){
			return angular.copy(this[target]);
		},
		set: function(target, elems){
			this[target] = elems;
			this['are' + target.charAt(0).toUpperCase() + target.substring(1)] = true;
		},
		areElements: function(target, theState){
			
			var boolean;
			if(target == 'municipios'){
				var randomIdx = Math.floor(Math.random() * Math.floor(this.municipios.length));
				// console.log(this.areAccountsPerAgent);
				boolean = (this.areMunicipios && this.municipios[randomIdx].estado == theState) ? true : false;

			}else{
				boolean = this.areStatesAvailable;
			}
			
			return boolean;
		}
	};

	return service;

}]);