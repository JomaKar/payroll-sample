'use strict';

var app = angular.module('PayRollWebApp');

app.controller('IntegradoresCtrl', ['$scope', function($scope){
	$scope.adminTarget = '';
	$scope.visibleUsers = '';
	$scope.targetRootUsers = [];

	$scope.$on('targetItemsSelected', function(e, val){
		$scope.$broadcast('usersToWorkWith', val);
	});

	$scope.$on('visibleUsers', function(e, val){
		$scope.$broadcast('filteringCriteria', val);
		// console.log('fromMain', val);
	});

	$scope.$on('actualPoc', function(e, val){
		$scope.$broadcast('theActualPoc', val);
	});
}]);