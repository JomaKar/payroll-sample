var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';


app.factory('pocsService', ['$http', 'userService', function($http, userService){
	var service = {
		allPOCs: [],
		allSupervisors: [],
		allSubdirectors: [],
		pocsByState: [],
		pocMembers: {},
		areAllSupervisors: false,
		areAllSubdirectors: false,
		areAllPOCs: false,
		arePocsByState: false,
		arePocMembers: false,
		endpoints: {
			pocs: 'src/json/pocs.json',
			pocsProd: '/pocs/usuario/',
			pocMembers: 'src/json/pocsMembers.json',
			pocFigures: 'src/json/pocsFigures.json',
			pocFiguresProd: '/figuras/rol/',
			pocMembersProd: '/poc-members/poc/',
			pocsEdit: '/pocs-edit',
			pocsNew: '/pocs-new',
			pocMemberEdit: '/poc-member-edit',
			pocMemberNew: '/pocs-member-new'
		},
		fetch: function(target, theData){
			var selfObj = this;
			var	url;
				// url = (target == 'statesAvailable') ? contextUrl + this.endpoints[target] : contextUrl + this.endpoints[target] + theData, //url prod
			var	usrID = userService.getUserID();

			switch(target){
				case 'allPOCs':
					url = selfObj.endpoints.pocs; //comment on prod
					//url = contextUrl + selfObj.endpoints.pocsProd + usrID; //uncomment on prod
					break;
				case 'pocsByState':
					url = selfObj.endpoints.pocs; //comment on prod
					// url = contextUrl + selfObj.endpoints.pocsProd + usrID + '/estado/' + theData.estado; //uncomment on prod
					break;
				case 'pocMembers':
					url = selfObj.endpoints.pocMembers; //comment on prod
					// url = contextUrl + selfObj.endpoints.pocMembersProd + theData.pocId; //uncomment on prod
					break;
				case 'allSupervisors':
				case 'allSubdirectors':
					url = selfObj.endpoints.pocFigures; //comment on prod
					// url = contextUrl + selfObj.endpoints.pocFiguresProd + theData.rol; //uncomment on prod
					break;
			}

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};

			$http
			.get(url, headers)
			.success(function(res){

				if(res.responseCode.status == 200) {
					switch(target){
						case 'allPOCs':
						case 'allSupervisors':
						case 'allSubdirectors':
							selfObj.set(target, res.data);
							break;
						case 'pocsByState':
							res.data.forEach(function(poc){
								poc.estado = theData.estado;
							});
							selfObj.set(target, res.data);
							break;
						case 'pocMembers':
							res.data.pocId = theData.pocId;
							selfObj.set(target, res.data);
							break;
					}

				}else{alert(res.responseCode.descripcion);}
			});
		},
		get: function(target){
			return angular.copy(this[target]);
		},
		set: function(target, elems){
			this[target] = elems;
			this['are' + target.charAt(0).toUpperCase() + target.substring(1)] = true;
		},
		areElements: function(target, extraData){
			var correspondantBoolean = 'are' + target.charAt(0).toUpperCase() + target.substring(1);
			var boolean;

			if(target == 'pocsByState'){
				var randomIdx = Math.floor(Math.random() * Math.floor(this.pocsByState.length));
				// console.log(this.areAccountsPerAgent);
				boolean = (this.arePocsByState && this.pocsByState[randomIdx].estado == extraData) ? true : false;

			}else if(target == 'pocMembers'){
				// console.log(this.areAccountsPerAgent);
				boolean = (this.arePocMembers && this.pocMembers.pocId == extraData) ? true : false;

			}else{
				boolean = this[correspondantBoolean];
			}
			
			return boolean;
		},
		createPOC: function(poc){
			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			},
				selfObj = this;
			return $http.post(selfObj.endpoints.pocsNew, JSON.stringify(poc), headers);
		},
		editPOC: function(poc){
			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			},
				selfObj = this;
			return $http.post(selfObj.endpoints.pocsEdit, JSON.stringify(poc), headers);
		},
		createPOCMember: function(pocMem){
			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};
			var selfObj = this;
			return $http.post(selfObj.endpoints.pocMemberNew, JSON.stringify(pocMem), headers);
		},
		editPOCMember: function(pocMem){
			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			},
				selfObj = this;
			return $http.post(selfObj.endpoints.pocMemberEdit, JSON.stringify(pocMem), headers);
		}
	};

	return service;

}]);