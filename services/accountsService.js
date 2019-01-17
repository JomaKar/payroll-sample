var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';


app.factory('accountsService', ['$http', 'userService', function($http, userService){
	var service = {
		accountsPerAgent: [],
		areAccountsPerAgent: false,
		allAccounts: [],
		areAllAccounts: false,
		endpoints: { //change on production
			accountsPerAgent: '/src/json/cuentasDev.json',
			accountsPerAgentProd: '/cuentas/integrador/',
			allAccounts: 'src/json/cuentasDev.json',
			allAccountsProd: '/cuentas/usuario/',
			assign: '/integraciones-asignar',
			reassign: '/integraciones-reasignar',
			delete: '/integraciones-reasignar'
		},
		fetch: function(){
			var selfObj = this,
				usrID = userService.getUserID();

			var url = selfObj.endpoints.allAccounts; //comment on production
			// var url = contextUrl + selfObj.endpoints.allAccountsProd + usrID; //uncomment on production

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};

			$http
			.get(url, headers)
			.success(function(res){
				if(res.responseCode.status == 200){
					selfObj.set('allAccounts', res.data);
				}else{
					alert(res.responseCode.descripcion);
				}
			});

		},
		fetchAccountsPerAgent(agent){
			var url = this.endpoints.accountsPerAgent,
				//url = contextUrl + selfObj.endpoints.accountsPerAgentProd + agent.userId, //uncomment on production
				headers = {
					"Content-type": "application/json",
					"X-HSBC-User-Id": userService.getUserToken(),
					"X-HSBC-User-Token": userService.getUserID()
				};



			return $http
			.get(url, headers)
			
		},
		get: function(target){
			return angular.copy(this[target]);
		},
		set: function(target, elems, theIntegradorId){
			if(target == 'accountsPerAgent') elems.forEach(function(el){ el.integradorId = theIntegradorId});
			this[target] = elems;
			this['are' + target.charAt(0).toUpperCase() + target.substring(1)] = true;
		},
		areElements: function(target, integradorId){
			var boolean;
			if(target == 'accountsPerAgent'){
				var randomIntegratorIdx = Math.floor(Math.random() * Math.floor(this.accountsPerAgent.length));
				// console.log(this.areAccountsPerAgent);
				boolean = (this.areAccountsPerAgent && this.accountsPerAgent[randomIntegratorIdx].integradorId == integradorId) ? true : false;

			}else{
				boolean = this.areAllAccounts;
			}
			
			return boolean;
		},
		deleteIntegrations: function(integraciones){
			var deleteUrl = this.endpoints.delete,
				selfObj = this,
				headers = headers = {
					"Content-type": "application/json",
					"X-HSBC-User-Id": userService.getUserToken(),
					"X-HSBC-User-Token": userService.getUserID()
				};

			return $http.post(deleteUrl, integraciones, headers);
		},
		editAccounts: function(editCase, data){
			var selfObj = this,
				editUrl = selfObj.endpoints[editCase],
				headers = {
					"Content-type": "application/json",
					"X-HSBC-User-Id": userService.getUserToken(),
					"X-HSBC-User-Token": userService.getUserID()
				};

			return $http.post(editUrl, JSON.stringify(data), headers);
		}
	};

	return service;

}]);