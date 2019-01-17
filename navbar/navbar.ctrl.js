var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('PayrollNavbarCtrl', 
	['$scope', '$routeParams', '$location', 'userService', 'geographicElementsService', 'accountsService',
	function($scope, $routeParams, $location, userService, geographicElementsService, accountsService){

	$scope.profileMenuIsOpen = false;
	$scope.adminMenuIsOpen = false;
	$scope.noMenu = false;

	$scope.theUser = {};
	$scope.userNewNotifications;
	$scope.userNewTutorials;

	$scope.folderStructureUrl = folderStructureUrl;

	$scope.menuStarted = function(){
		$scope.theUser.img = $scope.folderStructureUrl + 'src/images/myAvatar.png';
		if(window.location.hash !== '#!/login'){
			$scope.noMenu = false;
			$scope.showActiveViewItm();
		}else{
			$scope.noMenu = true;
		}
	}

	$scope.$on('$locationChangeSuccess', function($event, next, current){
		// console.log('from navbar', window.location.hash);
		(window.location.hash !== '#!/login') ? ($scope.noMenu = false,  $scope.showActiveViewItm()): $scope.noMenu = true;
	});

	$scope.showActiveViewItm = function(){
		var url = $location.url();
		var userInt, menuInt;
		var indexLastDiagonal = url.lastIndexOf('/');

		(userService.checkIfUser()) ? $scope.setUser() : userInt = setInterval(function(){ if(userService.checkIfUser()) $scope.setUser(), clearInterval(userInt); }, 5);

		var actualView = (indexLastDiagonal > 0) ? url.substring(1, indexLastDiagonal) : url.substring(1);

		menuInt = setInterval(function(){
			var navbarViewItm = document.getElementsByClassName(actualView + '-itm')[0];
			// console.log(url, navbarViewItm, actualView);
			if(navbarViewItm !== undefined) navbarViewItm.classList.add('active-itm'), clearInterval(menuInt);
		}, 5);
	}

	$scope.setUser = function(){
		$scope.theUser = userService.getUser();
		$scope.theUser.img = ($scope.theUser.img) ? $scope.theUser.img : $scope.folderStructureUrl + 'src/images/myAvatar.png'; 
		$scope.userNewNotifications = (userService.areElements('areUserNotifications')) ? userService.getUserTutorials()['filter'](function(not){return not.isNew == true}) : [];
		$scope.userNewTutorials = (userService.areElements('areUserTutorials')) ? userService.getUserTutorials()['filter'](function(tuto){return tuto.isNew == true}) : [];
	}

	$scope.goTo = function(path, ev){
		switch(path){
			case 'integradores':
			case 'location-pocs':
			case 'administrar/POCs':
			case 'administrar/usuarios':
			case 'administrar/sucursales':
				if(!geographicElementsService.areElements('statesAvailable', null)) geographicElementsService.fetch('statesAvailable', null);
				break;

			case 'assign-reassign':
				if(!geographicElementsService.areElements('statesAvailable', null)) geographicElementsService.fetch('statesAvailable', null);
          		if(!accountsService.areElements('allAccounts')) accountsService.fetch();
				break;

			// case 'administrar/centros-laborales':
			// 	if(!geographicElementsService.areElements('companies')) geographicElementsService.fetch('companies');
			// 	break;

			// case 'administrar/sucursales':
			// 	if(!geographicElementsService.areElements('cities')) geographicElementsService.fetch('cities');
			// 	break;

			case 'login':
				userService.clearUser();
				break;
		}

		$location.path(path);
		if(ev) $scope.activateItm(ev, false);
		$scope.closeMenu();
	}

    $scope.openMenu = function(ev, menu) {
    	$scope.adminMenuIsOpen = (menu == 'admin') ? true : false;
    	$scope.profileMenuIsOpen = (menu == 'profile') ? true : false;
    	if(ev) $scope.activateItm(ev, true);
    };

    $scope.closeMenu = function() {
    	$scope.adminMenuIsOpen = $scope.profileMenuIsOpen = false;
    };

    $scope.activateItm = function(ev, grandParentTarget){
    	var element = (!grandParentTarget) ? ev.currentTarget : ev.target.parentNode.parentNode;
		var siblings = Array.from(document.getElementsByClassName('navbar-itm'));

		siblings.forEach(function(el, i){ el.classList.remove('active-itm');});

		element.classList.add('active-itm');
    }

}])
	.directive('payrollNavbar', function(){
		return {
			restrict: 'E',
			controller: 'PayrollNavbarCtrl',
			templateUrl: folderStructureUrl + 'navbar/navbar.tmp.html',
			css: folderStructureUrl + 'css/navbar.css'
		}
	})