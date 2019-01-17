"use strict";
var app = angular.module('PayRollWebApp');

app.controller('AssignReassignCtrl', [
    '$scope',
    function ($scope) {
    
      $scope.accountToSearch = "";

      $scope.$on('theseAccountsTypeSelection', function(e, val){
        $scope.$broadcast('filterAccountsType', val);
      });

      $scope.$on('assignPOCChange', function(e, val){
        $scope.$broadcast('pocChange', val);
      });

     
}]);

     