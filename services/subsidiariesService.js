var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';

app.factory('subsidiariesService', ['$http','userService', function($http, userService){
	var service = {
		subsidiaries: [],
		areSubsidiaries: false,
		endpoints: {
			subsidiaries: 'src/json/subsidiaries.json',
			subsidiariesProd: '/sucursales/municipio/',
			editSubsidiaries: 'src/json/pocs.json',
			newSubsidiaries: 'src/json/pocMembers.json'
		},
		fetch: function(theData){
			var selfObj = this,
				usrID = userService.getUserID(),
				url = this.endpoints.subsidiaries;
				// url = contextUrl + this.endpoints.subsidiariesProd + theData.municipio + '/usuario/' + usrID;

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};

			$http
			.get(url, headers)
			.success(function(res){

				if(res.responseCode.status == 200) {
					res.data.forEach(function(mun){
						mun.municipio = theData.municipio;
					});
					selfObj.set(res.data);

				}else{alert(res.responseCode.descripcion);}
			});
		},
		get: function(){
			return angular.copy(this.subsidiaries);
		},
		set: function(elems){
			this.subsidiaries = elems;
			this.areSubsidiaries = true;
		},
		areElements: function(extraData){
			var randomIdx = Math.floor(Math.random() * Math.floor(this.subsidiaries.length));
			var boolean = (this.areSubsidiaries && this.subsidiaries[randomIdx].municipio == extraData) ? true : false;			
			return boolean;
		},
		newSubsidiary: function(subsidiary){
			var url = this.endpoints.newSubsidiaries;

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};
			return $http.post(url, JSON.stringify(subsidiary), headers);
		},
		editSubsidiary: function(subsidiary){
			var url = this.endpoints.editSubsidiary;

			var headers = {
				"Content-type": "application/json",
				"X-HSBC-User-Id": userService.getUserToken(),
				"X-HSBC-User-Token": userService.getUserID()
			};
			return $http.post(url, JSON.stringify(poc), headers);
		}
	};

	return service;

}]);