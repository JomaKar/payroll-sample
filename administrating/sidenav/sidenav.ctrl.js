var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('AdminLeftSideCtrl', 
	['$scope', '$routeParams', 'geographicElementsService', 'pocsService', 'subsidiariesService',
	function($scope, $routeParams, geographicElementsService, pocsService, subsidiariesService){

	$scope.fullArea = false;
	$scope.secondSelectVisible = false;

	$scope.localState = '';

	$scope.targetsFirstSelect = [];
	$scope.targetsSecondSelect = [];

	$scope.firstSelectPlaceholder = ''
	$scope.secondSelectPlaceholder = '';

	$scope.selectsPlaceholdersCollection = {
		firstSelect: {
			Usuarios: 'Estados',
			POCs: 'Estados',
			Centro: 'Empresas',
			Sucursales: 'Estados'
		},
		secondSelect: {
			Usuarios: 'POCs',
			Centro: 'Región',
			Sucursales: 'Municipios'
		}
	};

	$scope.$watch('$locationChangeSuccess', function(){
		var text = ($routeParams.adminTarget == 'centros-laborales') ? 'Centros de Trabajo' : $routeParams.adminTarget.charAt(0).toUpperCase() + $routeParams.adminTarget.substring(1);
		$scope.localState = text;

		var textPlaceholderSelection = ($scope.localState == 'Centros de Trabajo') ? 'Centro' : $scope.localState;


		$scope.firstSelectPlaceholder = $scope.selectsPlaceholdersCollection.firstSelect[textPlaceholderSelection];
		$scope.secondSelectPlaceholder = $scope.selectsPlaceholdersCollection.secondSelect[textPlaceholderSelection];

		switch($scope.localState){
			case('Usuarios'):
			case('POCs'):
			case('Sucursales'):
				if($scope.localState == 'Usuarios'){
					var pocsInt;
					if(pocsService.areElements('allPOCs')){
						$scope.targetsSecondSelect = pocsService.get('allPOCs');
					}else{
						pocsService.fetch('allPOCs');
						pocsInt = setInterval(function(){
							if(pocsService.areElements('allPOCs')) $scope.targetsSecondSelect = pocsService.get('allPOCs'), clearInterval(pocsInt);
						}, 5);
					}
					
				}

				$scope.fullArea = ($scope.localState == 'Usuarios') ? true : false;
				$scope.secondSelectVisible = ($scope.localState == 'Usuarios' || $scope.localState == 'Sucursales') ? true : false;

				var statesInt;
				if(geographicElementsService.areElements('statesAvailable', null)){
					$scope.targetsFirstSelect = geographicElementsService.get('statesAvailable');
				}else{
					geographicElementsService.fetch('statesAvailable');
					console.log('nothing happen');
					statesInt = setInterval(function(){
						console.log('in the loop', geographicElementsService.areElements('statesAvailable', null));
						if(geographicElementsService.areElements('statesAvailable')) $scope.targetsFirstSelect = geographicElementsService.get('statesAvailable'), clearInterval(statesInt), console.log('aft: ', geographicElementsService.get('statesAvailable'));;
					}, 5);
				}

				break;
			
			// case('Centros de Trabajo'):
			// 	$scope.secondSelectVisible = true;

			// 	var companiesInt;
			// 	if(geographicElementsService.areElements('companies')){
			// 		$scope.targetsFirstSelect = geographicElementsService.get('companies');
			// 	}else{
			// 		geographicElementsService.fetch('companies');
			// 		companiesInt = setInterval(function(){
			// 			if(geographicElementsService.areElements('companies')) $scope.targetsFirstSelect = geographicElementsService.get('companies'), clearInterval(statesInt);
			// 		}, 5);
			// 	}

			// 	break;

			// case('Sucursales'):
			// 	$scope.secondSelectVisible = true;
				

			// 	break;
		}
	});

	$scope.firstSelectResult = {};

	$scope.onChangeFirstSelect = function(fsSelectedOptionId){
		switch($scope.localState){
			case('Usuarios'):
			case('POCs'):
				var data = {estado: $scope.firstSelectResult.name};

				var pocsInt;
				if(pocsService.areElements('pocsByState', $scope.firstSelectResult.name)){
					$scope.targetsSecondSelect = pocsService.get('pocsByState');
				}else{
					pocsService.fetch('pocsByState', data);
					pocsInt = setInterval(function(){
						if(pocsService.areElements('pocsByState', $scope.firstSelectResult.name)){
							if($scope.localState == 'Usuarios') $scope.targetsSecondSelect = pocsService.get('pocsByState');
							if($scope.localState == 'POCs') $scope.targetRootUsers.target = pocsService.get('pocsByState'), $scope.$emit('targetItemsSelected', $scope.targetRootUsers);
							clearInterval(pocsInt);
						}
					}, 5);
				}

				break;
			
			// case('Centros de Trabajo'):
			// 	break;

			case('Sucursales'):
				var data = $scope.firstSelectResult.name;
				
				var munInt;
				if(geographicElementsService.areElements('municipios', $scope.firstSelectResult.name)){
					$scope.targetsSecondSelect = geographicElementsService.get('municipios');
				}else{
					geographicElementsService.fetch('municipios', data);
					munInt = setInterval(function(){
						if(geographicElementsService.areElements('municipios', $scope.firstSelectResult.name)) $scope.targetsSecondSelect = geographicElementsService.get('municipios'), clearInterval(munInt);
					}, 5);
				}

				break;

		}
	};


	$scope.targetRootUsers = {target: []};
	$scope.ssSelectedOption = {};
	$scope.allUsersOnPoc = {};
	$scope.onChangeSecondSelect = function(){
		
		switch($scope.localState){
			case('Usuarios'):
				var data = {pocId: $scope.ssSelectedOption.obj.id};

				pocsService.fetch('pocMembers', data);

				var pocMemInt = setInterval(function(){
					if(pocsService.areElements('pocMembers', $scope.ssSelectedOption.obj.id)){
						$scope.allUsersOnPoc = pocsService.get('pocMembers');

						for(var key in angular.copy($scope.allUsersOnPoc)){

							if(key !== 'pocId'){
								if(key == 'supervisores') $scope.$emit('pocSupervisores', angular.copy($scope.allUsersOnPoc[key]));
								$scope.targetRootUsers.target = $scope.targetRootUsers.target.concat($scope.allUsersOnPoc[key]);
							}else{ $scope.targetRootUsers.pocId = $scope.allUsersOnPoc[key];}
						}

						$scope.$emit('targetItemsSelected', $scope.targetRootUsers);
						clearInterval(pocMemInt);
					}
				}, 5);
				break;
			
			// case('Centros de Trabajo'):
			// 	$scope.targetRootUsers.target = $scope.targetsSecondSelect.filter(function(el){return el.id === sentOptId})[0]['centers'];
			// 	$scope.$emit('targetItemsSelected', $scope.targetRootUsers.target);
			// 	break;

			case('Sucursales'):
				var data = {municipio: $scope.ssSelectedOption.obj.name};

				subsidiariesService.fetch(data);

				var subsidiariesInt = setInterval(function(){
					if(subsidiariesService.areElements($scope.ssSelectedOption.obj.name)){
						$scope.targetRootUsers.target = subsidiariesService.get();
						$scope.$emit('targetItemsSelected', $scope.targetRootUsers);
						clearInterval(subsidiariesInt);
					}
				}, 5);
		}
	};

	$scope.visibleUsers = {};
	$scope.whichUsers = function(){
		var selectedUsers = angular.copy($scope.allUsersOnPoc[$scope.visibleUsers.rol]);

		$scope.$emit('visibleUsers', selectedUsers);
	}

}])
.directive('adminLeftSide', function(){
	return {
		restrict: 'E',
		controller: 'AdminLeftSideCtrl',
		templateUrl: folderStructureUrl + 'administrating/sidenav/sidenav.tmp.html'
	}
});