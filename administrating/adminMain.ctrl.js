var app = angular.module('PayRollWebApp');

app.controller('AdminMainCtrl', ['$scope', '$routeParams', '$timeout', function($scope, $routeParams, $timeout){
	$scope.adminTarget = '';
	$scope.targetRootUsers = [];

	$scope.$on('$viewContentLoaded', function(){
		var text = ($routeParams.adminTarget == 'centros-laborales') ? 'Centros de Trabajo' : $routeParams.adminTarget.charAt(0).toUpperCase() + $routeParams.adminTarget.substring(1);
		$scope.adminTarget = text;
		$timeout(function(){
			$scope.$broadcast('adminStart', $scope.adminTarget);
		}, 25);
	})


	$scope.$on('targetItemsSelected', function(e, val){
		$scope.$broadcast('usersToWorkWith', val);
	})

	$scope.$on('visibleUsers', function(e, val){
		$scope.$broadcast('specifictUsers', val);
	})

	$scope.$on('pocSupervisores', function(e, val){
		$scope.$broadcast('thePocSupervisores', val);
	})

}]);