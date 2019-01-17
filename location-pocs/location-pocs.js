"use strict";
var app = angular.module('PayRollWebApp');

app.controller('LocationPocsCtrl', [
    '$scope',
    '$mdSidenav',
    'locationService',
    function ($scope, $mdSidenav, locationService) {
    
      $scope.currentLatitude = "";
      $scope.currentLongitude = "";
      $scope.membersLocation = [];
      $scope.agentDetails = {};
      $scope.activeDetail = false;

      $scope.initPayrollMaps = function(){
          // console.log(sessionStorage.getItem('mapReady'));
          if(sessionStorage.getItem('mapReady') == 'yes'){
              locationService.startMap();
          }else{
            var waitInterval = setInterval(function(){
              if(sessionStorage.getItem('mapReady') == 'yes') clearInterval(waitInterval), locationService.startMap();
            }, 5);
          }
      };
    

      $scope.showDetails = function(ev, theMember){
        var elem = (ev.currentTarget) ? ev.currentTarget : ev.target;

        $scope.agentDetails = angular.copy(theMember);
        // console.log(ev.currentTarget, ev.target);
        console.log('$scope.agentDetails', $scope.agentDetails);
        // USEFULL WHEN LOCATIONS WORK
        
        var marker = document.getElementById('content-'+theMember.userId);

        if(!marker){
          locationService.setLocations([theMember]);
          locationService.showLocations({lat: theMember.latitude, lng: theMember.longitude}, 'simpleMarker', null);
        }
        
        
        var siblings = Array.from(document.getElementsByClassName('agent-itm'));
        // USEFULL WHEN LOCATIONS WORK
        var markerSiblings = Array.from(document.getElementsByClassName('simpleMarker'));

        siblings.forEach(function(e, i){
          e.classList.remove('active');
        });

        // USEFULL WHEN LOCATIONS WORK
        
        markerSiblings.forEach(function(e, i){
          e.classList.remove('active');
        });


        if(!document.getElementById('content-'+theMember.userId)){
          var waitingForContentInt = setInterval(function(){
              if(document.getElementById('content-'+theMember.userId) !== null) {
                  marker = document.getElementById('content-'+theMember.userId);
                  marker.classList.add('active');
                  clearInterval(waitingForContentInt);
              }
          }, 10);
        }else{
            marker.classList.add('active');
        }
        

        elem.classList.add('active');
        $scope.activeDetail = true;

        // USEFULL WHEN LOCATIONS WORK
        locationService.centerOnSomething(theMember);
      }

      $scope.hideDetails = function(){
        $scope.agentDetails = {};
        $scope.activeDetail = false;
        $scope.agentWorkStats = [];

        var agentItms = Array.from(document.getElementsByClassName('agent-itm'));

        // USEFULL WHEN LOCATIONS WORK
        var visibleMarkers = Array.from(document.getElementsByClassName('simpleMarker'));

        agentItms.forEach(function(e, i){
          e.classList.remove('active');
        });

        // USEFULL WHEN LOCATIONS WORK
        
        visibleMarkers.forEach(function(e, i){
          e.classList.remove('active');
        });
        
      }
     
 }]);

     