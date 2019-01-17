var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('IntegradoresLeftSideCtrl', 
	['$scope', '$routeParams', 'geographicElementsService', 'pocsService', 'integratorsService',
	function($scope, $routeParams, geographicElementsService, pocsService, integratorsService){

	$scope.targetsFirstSelect = [];
	$scope.targetsSecondSelect = [];

	$scope.pocAvailable = false;


	$scope.initFunc = function(){
		var statesInt;
		if(geographicElementsService.areElements('statesAvailable')){
			$scope.targetsFirstSelect = geographicElementsService.get('statesAvailable');
		}else{
			geographicElementsService.fetch('statesAvailable');
			statesInt = setInterval(function(){
				if(geographicElementsService.areElements('statesAvailable')) $scope.targetsFirstSelect = geographicElementsService.get('statesAvailable'), clearInterval(statesInt);
			}, 5);
		}

		var pocsInt;
		if(pocsService.areElements('allPOCs')){
			$scope.targetsSecondSelect = pocsService.get('allPOCs');
		}else{
			pocsService.fetch('allPOCs');
			pocsInt = setInterval(function(){
				if(pocsService.areElements('allPOCs')) $scope.targetsSecondSelect = pocsService.get('allPOCs'), clearInterval(pocsInt);
			}, 5);
		}
	};


	$scope.fsSelectedOption = {};

	$scope.onChangeFirstSelect = function(){
		var data = { estado: $scope.fsSelectedOption.name};

		var pocsInt;
		if(pocsService.areElements('pocsByState', $scope.fsSelectedOption.name)){
			$scope.targetsSecondSelect = pocsService.get('pocsByState');
		}else{
			pocsService.fetch('pocsByState', data);
			pocsInt = setInterval(function(){
				if(pocsService.areElements('pocsByState', $scope.fsSelectedOption.name)){
					$scope.targetsSecondSelect = pocsService.get('pocsByState');
					clearInterval(pocsInt);
				}
			}, 5);
		}
	};


	$scope.ssSelectedOption = {};

	$scope.onChangeSecondSelect = function(pocId, poc){
		$scope.$emit('actualPoc', poc);
		$scope.ssSelectedOption.pocId = pocId;

		if(integratorsService.areElements($scope.ssSelectedOption.pocId)){
			$scope.workWithAgents();
		}else{
			integratorsService.fetch({pocId: $scope.ssSelectedOption.pocId});

			var integratorsInt = setInterval(function(){
				if(integratorsService.areElements($scope.ssSelectedOption.pocId)){
					$scope.workWithAgents();
					clearInterval(integratorsInt);
				}
			}, 5);
		}
	};

	$scope.workWithAgents = function(){
		$scope.targetRootUsers = integratorsService.get();
		$scope.pocAvailable = true;
		$scope.$emit('targetItemsSelected', $scope.targetRootUsers);
	}


	$scope.whichUsers = function(val){
		// console.log('fromSideNav', val);
		$scope.$emit('visibleUsers', val);
	}

}])
.directive('integradoresLeftSide', function(){
	return {
		restrict: 'E',
		controller: 'IntegradoresLeftSideCtrl',
		templateUrl: folderStructureUrl + 'integradores/sidenav/sidenav.tmp.html'
	}
});