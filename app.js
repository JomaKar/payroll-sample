'use strict';

var contextUrl = '';
var folderStructureUrl = '';
if(document.body.attributes['data-context'] !== undefined && document.body.attributes['data-context'] !== null){
  contextUrl = document.body.attributes['data-context'].value;
  folderStructureUrl = contextUrl + "/statics/";
  sessionStorage.setItem('contextUrl', contextUrl);
  sessionStorage.setItem('folderStructureUrl', folderStructureUrl);
}

window.onbeforeunload = function(){
  sessionStorage.clear();
}
var app = angular.module('PayRollWebApp', [
  'ngRoute',
  'ngMaterial',
  'chart.js',
  'angularCSS'
]);
app.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('light-blue')
  .accentPalette('orange');
});
app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/location-pocs'});

  $routeProvider.when('/login', {
    templateUrl:  folderStructureUrl + 'login/login.tmp.html',
    controller: 'LoginCtrl',
    css: folderStructureUrl + 'css/login.css'
  });

  $routeProvider.when('/location-pocs', {
    templateUrl:  folderStructureUrl + 'location-pocs/location-pocs.html',
    resolve: {
      check: function(userService, $location, geographicElementsService, pocsService){
        if(!userService.checkIfUser()){
          $location.path('/login');
        }else{
          if(!geographicElementsService.areElements('statesAvailable')) geographicElementsService.fetch('statesAvailable');
          if(!pocsService.areElements('allPOCs')) pocsService.fetch('allPOCs');
        }
      }
    },
    controller: 'LocationPocsCtrl',
    css: folderStructureUrl + 'css/location-pocs.css'
  
  }).when('/integradores', {
    templateUrl:  folderStructureUrl + 'integradores/integradoresMain.tmp.html',
    resolve: {
      check: function(userService, $location, geographicElementsService){
        if(!userService.checkIfUser()){
          $location.path('/login');
        }else{
          if(!geographicElementsService.areElements('statesAvailable')) geographicElementsService.fetch('statesAvailable');
        }
      }
    },
    controller: 'IntegradoresCtrl',
    css: folderStructureUrl + 'css/integradores.css'
  
  }).when('/assign-reassign', {
    templateUrl:  folderStructureUrl + 'assign-reassign/assign-reassign.html',
    resolve: {
      check: function(userService, $location, geographicElementsService, accountsService, enterprisesService, pocsService){
        if(!userService.checkIfUser()){
          $location.path('/login');
        }else{
          if(!geographicElementsService.areElements('statesAvailable')) geographicElementsService.fetch('statesAvailable');
          if(!accountsService.areElements('allAccounts', null)) accountsService.fetch();
          if(!enterprisesService.areElements('allEnterprises')) enterprisesService.fetch('allEnterprises');
          if(!pocsService.areElements('allPOCs')) pocsService.fetch('allPOCs');
        }
      }
    },
    controller: 'AssignReassignCtrl',
    css: folderStructureUrl + 'css/assign-reassign.css'
  
  }).when('/administrar', {redirectTo: '/administrar/usuarios'})

  .when('/administrar/:adminTarget', {
    templateUrl:  folderStructureUrl + 'administrating/adminMain.tmp.html',
    resolve: {
      check: function(userService, $location, $route, geographicElementsService){
        var adminTar = $route.current.params.adminTarget;
        if(!userService.checkIfUser()){
          $location.path('/login');
        }else{
          if(!geographicElementsService.areElements('statesAvailable', null) && (adminTar == 'usuarios' || adminTar == 'POCs' || adminTar == 'sucursales')) geographicElementsService.fetch('statesAvailable', null);
        }
      }
    },
    controller: 'AdminMainCtrl',
    css: folderStructureUrl + 'css/admin-main.css'
  
  }).when('/perfil', {redirectTo: '/perfil/mi-perfil'}).when('/perfil/:profileSection', {
    templateUrl:  folderStructureUrl + 'profile/profileMain.tmp.html',
    resolve: {
      check: function(userService, $location){
        if(!userService.checkIfUser()){
          $location.path('/login');
        }
      }
    },
    controller: 'ProfileMainCtrl',
    css: contextUrl + '/webapp/statics/css/profile-main.css'
  
  });


}]);

app.directive('resize', function ($window) {
  return function (scope) {
      scope.width = $window.innerWidth;
      scope.height = $window.innerHeight;

      function resizeApp(){
          scope.width = $window.innerWidth;
          scope.height = $window.innerHeight;
          scope.ConstHeightPanelTop = 447;
          scope.ConstHeightToolbarTop = 69;
      
          scope.objStyleWrapperTable = {
            "height": (scope.height - scope.ConstHeightPanelTop) + "px"
          }
          scope.objStyleWrapperHeightContent = {
            "height": (scope.height - scope.ConstHeightToolbarTop) + "px"
          }
          scope.objStyleDetailHeightContent = {
            "height": (scope.height - scope.ConstHeightToolbarTop - 50) + "px",
            "overflow": "auto"
          } 
      }

      angular.element($window).bind('resize', function () {
          scope.$apply(function () {
              resizeApp();
          });
      });

      angular.element(document).ready(function () {
        scope.$apply(function () {
          resizeApp();
        }); 
      });

      /*scope.$watch('hideShowInfoPoc', function () {
        scope.$apply(function () {
          console.log("Un cambio en hideShowInfoPoc")
          resizeApp();
        }); 
      });*/
    };
});