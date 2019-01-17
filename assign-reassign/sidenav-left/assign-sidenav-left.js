"use strict";
var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('AssignSideNavLeftCtrl', 
      ['$scope', 'geographicElementsService', 'pocsService', 'userService',
      function ($scope, geographicElementsService, pocsService, userService) {

      $scope.hideShowInfoPoc = true;
      $scope.assignStates = [];
      $scope.assignPocs = [];
      $scope.allPOCs = [];
      $scope.matchedPOCs = [];
      $scope.accountsToSee = {};
      
      $scope.initElement = function(){
          var statesInt,
              pocsInt;

          if(geographicElementsService.areElements('statesAvailable')){
              $scope.assignStates = geographicElementsService.get('statesAvailable');
          }else{
              geographicElementsService.fetch('statesAvailable');
              statesInt = setInterval(function(){
                  if(geographicElementsService.areElements('statesAvailable')) $scope.assignStates = geographicElementsService.get('statesAvailable'), clearInterval(statesInt);
              }, 5);
          }


          if(pocsService.areElements('allPOCs')){
              $scope.allPOCs = pocsService.get('allPOCs');
              $scope.matchedPOCs = angular.copy($scope.allPOCs);
          }else{
              pocsService.fetch('allPOCs');
              pocsInt = setInterval(function(){
                  if(pocsService.areElements('allPOCs')) {
                      $scope.allPOCs = pocsService.get('allPOCs');
                      $scope.matchedPOCs = angular.copy($scope.allPOCs);
                      clearInterval(pocsInt);
                  }
              }, 5);
          }
      };


      $scope.selectedState = {};

      $scope.onChangeEstado = function(){
          var pocsInt;

          if(pocsService.areElements('pocsByState', $scope.selectedState.name)){
              $scope.matchedPOCs = pocsService.get('pocsByState');
              console.log($scope.matchedPOCs);
          }else{
              pocsService.fetch('pocsByState', {estado: $scope.selectedState.name});
              pocsInt = setInterval(function(){
                  if(pocsService.areElements('pocsByState', $scope.selectedState.name)) {
                      $scope.matchedPOCs = pocsService.get('pocsByState');
                      // console.log($scope.matchedPOCs);
                      clearInterval(pocsInt);
                  }
              }, 5);
          }

      };

      $scope.selectedPoc = {};

      $scope.onChangePocs = function(){
          $scope.$emit('assignPOCChange', $scope.selectedPoc.id);
      };

      $scope.whichAccounts = function(){
        $scope.$emit('theseAccountsTypeSelection', $scope.accountsToSee.val);
      }

 }])
.directive('assignLeftSide', function () {
    return {
      restrict: 'E',
      controller: 'AssignSideNavLeftCtrl',
      templateUrl: folderStructureUrl + 'assign-reassign/sidenav-left/assign-sidenav-left.html'
    }
});
