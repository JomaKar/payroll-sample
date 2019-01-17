"use strict";
var app = angular.module('PayRollWebApp');

app.controller('PayrollWebCtrl', [
    '$scope',
    '$timeout',
    '$mdSidenav',
    '$log',
    'locationService',
    'userService',
    function ($scope, $mdSidenav, $timeout, $log, locationService, userService) {
      $scope.toggleLeft = buildDelayedToggler('left');
      $scope.toggleRight = buildToggler('right');
      $scope.pocId = "";
      $scope.poc = {};
      $scope.pocs = [];
      $scope.states = [];
      $scope.pocsFilter = [];
      
      $scope.agentDetails = {};
      $scope.agentWorkStats = [];
      
      $scope.data = [
        [0, 0, 0, 0, 0]
      ];

      $scope.initPayrollWeb = function(){

        locationService.loadGoogleMaps().then(function(){
          if(window.google !== undefined) window.sessionStorage.setItem('mapReady', 'yes');
        }, 
        function(reasonFailed) {
              console.log('Failed: ' + reasonFailed);
        }, function(notify){
              if(window.google !== undefined) window.sessionStorage.setItem('mapReady', 'yes');
              // console.log(notify);
        });
        //$scope.getPayrollData("src/json/pocs.json", "pocs");
      };
      
      $scope.isOpenRight = function(){
     
          return $mdSidenav('right').isOpen();
      };

      $scope.pruebaTest = function(args){
        // console.log("Entraste a la prueba");
        $scope.$broadcast('loadMaps', args);
      }

      /**
      * Supplies a function that will continue to operate until the
      * time is up.
      */
      function debounce(func, wait, context) {
          var timer;
      
          return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
              timer = undefined;
              func.apply(context, args);
            }, wait || 10);
          };
      }
      
      /**
      * Build handler to open/close a SideNav; when animation finishes
      * report completion in console
      */
      function buildDelayedToggler(navID) {
        return debounce(function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
              .toggle()
              .then(function () {
                  $log.debug("toggle " + navID + " is done");
                });
        }, 200);
      }
      
      function buildToggler(navID) {
        return function() {
        // Component lookup should always be available since we are not using `ng-if`
          $mdSidenav(navID)
                  .toggle()
                  .then(function () {
                    $log.debug("toggle " + navID + " is done");
          });
        };
      }


      
 }]);


     