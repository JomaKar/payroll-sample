var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';


app.factory('enterprisesService', ['$http', 'userService', function($http, userService){
	var service = {
		workCenters: [],
		areWorkCenters: false,
		allEnterprises: [],
		areAllEnterprises: false,
		endpoints: {
			allEnterprises: 'src/json/enterprises.json',
			allEnterprisesProd: '/empresas/usuario/',
			workCenters: 'src/json/workCenters.json',
			workCentersEdit: '/work-centers-edit',
			workCentersNew: '/work-centers-new'
		},
		fetch: function(target, data){
			var selfObj = this,
				usrID = userService.getUserID();

			var url = contextUrl + this.endpoints[target];
			// var	url = contextUrl + this.endpoints[target + 'Prod'] + usrID;

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};

			$http
			.get(url, headers)
			.success(function(res){
				if(res.responseCode.status == 200){
					switch(target){
						case 'allEnterprises':
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
		areElements: function(target){
			var correspondantBoolean = 'are' + target.charAt(0).toUpperCase() + target.substring(1);
			return this[correspondantBoolean];
		},
		createWorkCenters: function(workCenter){
			var selfObj = this;
		},
		editWorkCenters: function(editCase, data){
			var selfObj = this;
		}
	};

	return service;

}]);