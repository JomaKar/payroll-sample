var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';

app.controller('LoginCtrl', 
	['$scope', '$routeParams', 'userService', '$location', 'geographicElementsService', 'accountsService', 'pocsService', 'enterprisesService',
	function($scope, $routeParams, userService, $location, geographicElementsService, accountsService, pocsService, enterprisesService){

		$scope.theUser = {};
		$scope.validForm = false;
		$scope.showPassword = false;
		$scope.folderStructureUrl = folderStructureUrl;


		$scope.seePass = function(){
			$scope.showPassword = !$scope.showPassword;
		}

		$scope.checkLogin = function(ev){
			ev.preventDefault();
			var data = JSON.stringify({userId: $scope.theUser.userId, password: $scope.theUser.password});


			userService.login(data).success(function(res){
				if(res.responseCode.status == 200){
					// set userToken
					if(res.data.token) {
		            	userService.setUserToken(res.data.token);		            	
		            }
		            userService.setUserID($scope.theUser.userId);

					// fetch necessary info in next view
					geographicElementsService.fetch('statesAvailable');
					
		            accountsService.fetch();
		            pocsService.fetch('allPOCs');
		            enterprisesService.fetch('allEnterprises');
		            
		            
		            userService.setActualUser(res.data);

		            userService.fetchUserNotifications($scope.theUser.userId).success(function(res){
		            	if(res.responseCode.status == 200) userService.setUserNotifications(res.data);
		            }).error(function(e){
		            	console.error(e);
		            });

		            userService.fetchUserTutorials($scope.theUser.userId).success(function(res){
		            	if(res.responseCode.status == 200) userService.setUserTutorials(res.data);
		            }).error(function(e){
		            	console.error(e);
		            });

		            $location.path('/assign-reassign');
		            
				}else{
					alert(res.responseCode.descripcion);
					var theInputs = document.getElementsByClassName('login-input');

					theInputs[0].value = theInputs[1].value = '';
					$scope.theUser = {};
				}
			}).error(function(e){
				alert(e);
				$scope.theUser = {};
			})
		}

		$scope.checkContent = function(form){
			var theInput = document.getElementsByClassName('login-input')[0];
			$scope.validForm = (theInput.value.length > 0) ? true : false;
		}

}])
.directive('loginPage', function(){
	return {
		restrict: 'E',
		controller: 'LoginCtrl',
		templateUrl: folderStructureUrl + 'login/login.tmp.html'
	}
});