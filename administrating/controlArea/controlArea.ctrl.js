var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('AdminControllAreaCtrl', ['$scope', '$routeParams', '$mdDialog', 'controlPanelService', 'userService', 'pocsService', 'subsidiariesService',
	function($scope, $routeParams, $mdDialog, controlPanelService, userService, pocsService, subsidiariesService){
	$scope.viewValue = '';
	$scope.shortText = '';
	$scope.onlyShowActives = false;
	$scope.activatingNews = false;
	$scope.actionSuccess = false;
	$scope.originalTargetUsers = [];
	$scope.targetUsers = [];
	$scope.allSubdirectors = [];
	$scope.allSupervisors = [];
	$scope.allPOCs = [];
	$scope.secondColumnIcon = '';
	$scope.thirdColumnIcon = '';
	$scope.targetBeforeChanges = {};

	$scope.withAminPriviledges = (userService.getUser()['rol'] == 'ADMINISTRADOR') ? true : false;

	$scope.columnsIconsCollection = {
		secondColumn: {
			Usuario: 'icon-phone',
			POC: 'icon-people',
			Centro: 'icon-phone',
			Sucursal: 'icon-location-on',
			Permiso: ''
		},
		thirdColumn: {
			Usuario: 'icon-people',
			POC: 'icon-people',
			Centro: 'icon-contact-phone',
			Sucursal: 'icon-house',
			Permiso: ''
		}
	};

	$scope.formToLoadKey = '';
	$scope.listView = '';

	$scope.$on('adminStart', function(e, val){
		$scope.viewValue = val;
		$scope.shortText = (val == 'Centros de Trabajo') ? 'Centro' : (val == 'Sucursales' ? val.substring(0, val.length - 2) : val.substring(0, val.length - 1));
		$scope.secondColumnIcon = $scope.columnsIconsCollection.secondColumn[$scope.shortText];
		$scope.thirdColumnIcon = $scope.columnsIconsCollection.thirdColumn[$scope.shortText];

		switch($scope.shortText){
			case('Usuario'):
				$scope.formToLoadKey = 'userForm';
				$scope.listView = 'userList'; 

				if(pocsService.areElements('allSubdirectors')){
					$scope.allSubdirectors = pocsService.get('allSubdirectors');
				}else{
					pocsService.fetch('allSubdirectors');

					var subInt = setInterval(function(){
						if(pocsService.areElements('allSubdirectors')){
							$scope.allSubdirectors = pocsService.get('allSubdirectors');
							clearInterval(subInt);
						}
					}, 5);
				}

				break;
			case('POC'):
				$scope.formToLoadKey = 'pocsForm';
				$scope.listView = 'pocsList';


				if(pocsService.areElements('allSubdirectors')){
					$scope.allSubdirectors = pocsService.get('allSubdirectors');
				}else{
					pocsService.fetch('allSubdirectors');

					var subInt = setInterval(function(){
						if(pocsService.areElements('allSubdirectors')){
							$scope.allSubdirectors = pocsService.get('allSubdirectors');
							clearInterval(subInt);
						}
					}, 5);
				}

				if(pocsService.areElements('allSupervisors')){
					$scope.allSupervisors = pocsService.get('allSupervisors');
				}else{
					pocsService.fetch('allSupervisors');

					var supInt = setInterval(function(){
						if(pocsService.areElements('allSupervisors')){
							$scope.allSupervisors = pocsService.get('allSupervisors');
							clearInterval(supInt);
						}
					}, 5);
				}

				break;
			case('Centro'):
				$scope.formToLoadKey = 'workCentersForm';
				$scope.listView = 'workCentersList';
				break;
			case('Sucursal'):
				$scope.formToLoadKey = 'subsidiariesForm';
				$scope.listView = 'subsidiariesList';

				if(pocsService.areElements('allPOCs')){
					$scope.allPOCs = pocsService.get('allPOCs');
				}else{
					pocsService.fetch('allPOCs');

					var subInt = setInterval(function(){
						if(pocsService.areElements('allPOCs')){
							$scope.allPOCs = pocsService.get('allPOCs');
							clearInterval(subInt);
						}
					}, 5);
				}
				break;
		}

		$scope.listView = folderStructureUrl + 'administrating/controlArea/lists/' +  $scope.listView + '.tmp.html';
	});

	$scope.$on('usersToWorkWith', function(e, val){
		$scope.activatingNews = true;
		// console.log('onSection', val);
		$scope.originalTargetUsers = angular.copy(val.target);
		$scope.targetUsers = angular.copy($scope.originalTargetUsers);
	});

	$scope.$on('specifictUsers', function(e, val){
		$scope.originalTargetUsers = val;
		$scope.targetUsers = angular.copy($scope.originalTargetUsers);
	});

	$scope.thisPocSupervisores = [];
	$scope.$on('thePocSupervisores', function(e, val){
		val.forEach(function(sup){
			var dataObj = {
				name: sup.userName,
				id: sup.userId
			};

			$scope.thisPocSupervisores.push(dataObj);
		});
	});


	$scope.searching = function(ev){
		var usersList = document.getElementsByClassName('users-target-list')[0];

		var inputTxt = ev.target.value.trim();

        var isNumber = (!isNaN(inputTxt) && inputTxt !== '') ? true : false;

        inputTxt = (!isNumber) ? inputTxt.trim().charAt(0).toUpperCase() + inputTxt.trim().slice(1) : inputTxt;

        // its not a number and its an empty string
        if(!isNumber && inputTxt.length < 1){
            $scope.targetUsers = angular.copy($scope.originalTargetUsers);
            usersList.classList.remove('empty-list');

        // its not a number but its not an empty string      
        }else if(!isNumber && inputTxt.length >= 1){

            $scope.targetUsers = $scope.originalTargetUsers.filter(function(el){
            	var property;
            	switch($scope.shortText){
            		case 'Usuario':
            			property = 'userName';
            			break;
            		case 'POC':
            		case 'Sucursal':
            			property = 'name';
            			break;
            	}
            	return el[property].indexOf(inputTxt) == 0;
            });

            ($scope.targetUsers.length > 0) ? usersList.classList.remove('empty-list') : usersList.classList.add('empty-list');

        // its a number
        }else if(isNumber){

            var agentsMatched = [];

            $scope.targetUsers = $scope.originalTargetUsers.filter(function(el){
            	var propertyId;
            	switch($scope.shortText){
            		case 'Usuario':
            			propertyId = 'userId';
            			break;
            		case 'POC':
            		case 'Sucursal':
            			propertyId = 'id';
            			break;
            	}

            	var idNum = (typeof el[propertyId] == 'number') ? el[propertyId].toString() : el[propertyId].trim();
            	return idNum.indexOf(inputTxt) == 0;
            });

            ($scope.targetUsers.length > 0) ? usersList.classList.remove('empty-list') : usersList.classList.add('empty-list');

        }
	};

	$scope.changeVisibleElements = function(onlyActives){
		controlPanelService.changeElementsDependingOnActivity(onlyActives);
	}


	$scope.adminDialogShow = function(event, action, target){
		var actionName = (action == 'edit') ? 'Editar ' + $scope.viewValue : 'Nuevo ' + $scope.viewValue;
		var baseActionText = (action == 'edit') ? 'APLICAR CAMBIOS' : 'CREAR ' + $scope.shortText.toUpperCase();
		var targetToSend = (target !== undefined) ? target : {};
		if(target !== undefined) $scope.targetBeforeChanges = angular.copy(targetToSend);
		var toEdit = (action == 'edit') ? true : false;

		if($scope.withAminPriviledges){
			$mdDialog.show({
				controller: DialogController,
				templateUrl: 'administrating/dialog/dialog.tmp.html',
				parent: angular.element(document.body),
				locals: {
					sentTarget: targetToSend,
					toDoAction: actionName,
					toDoText: baseActionText,
					editTrue: toEdit,
					formToLoad: $scope.formToLoadKey,
					targetName: $scope.shortText,
					specPocSup : $scope.thisPocSupervisores,
					allSubdirectors : $scope.allSubdirectors,
					allSupervisors : $scope.allSupervisors,
					thePocs: $scope.allPOCs,
					onSuccess: $scope.actionSuccess
				},
				targetEvent: event,
				clickOutsideToClose:false
			});
		}
	}

	function DialogController($scope, $mdDialog, sentTarget, toDoAction, toDoText, editTrue, formToLoad, targetName, specPocSup, allSubdirectors, allSupervisors, thePocs, onSuccess){
		$scope.actionSuccess = onSuccess;
		$scope.target = sentTarget;
		$scope.action = toDoAction;
		$scope.targetUserName = targetName;
		$scope.buttonText = toDoText;

		$scope.userHasLider = $scope.target.haveLeader;

		$scope.toEdit = (editTrue) ? true : false;
		$scope.userImageChanged = false;
		$scope.imgPath = ($scope.target.profileImg) ? ($scope.target.profileImg.indexOf('data:image') !== -1 ? '' : folderStructureUrl + 'src/images/') : '';

		$scope.userImage = ($scope.target.profileImg) ? $scope.imgPath + $scope.target.profileImg : folderStructureUrl + 'src/images/myAvatar.png';

		$scope.formView = folderStructureUrl + 'administrating/dialog/forms/' +  formToLoad + '.tmp.html';

		$scope.justClosing = false;
		$scope.validForm = (editTrue) ? true : false;

		$scope.rols = ['Administrador', 'Subdirector', 'Supervisor', 'Integrador', 'Documentador'];
		$scope.statusOptions = [{name: 'Activo',val: 1},{	name: 'Inactivo',	val: 0}];

		$scope.specificPocSupervisors = specPocSup;
		$scope.pocsSubdirectors = allSubdirectors;
		$scope.pocsSupervisors = allSupervisors;
		$scope.usefullPocs = thePocs;

		$scope.possibleLeaders = [];

		$scope.basicSetup = function(form){
			if($scope.targetUserName === 'Usuario'){
				var sups = angular.copy($scope.specificPocSupervisors),
					subs = angular.copy($scope.pocsSubdirectors);

				if($scope.userHasLider){
					var rol = $scope.target.rol.toLowerCase();
					if(rol == 'integrador'){
						$scope.possibleLeaders = sups;
					}else if (rol == 'supervisor'){
						$scope.possibleLeaders = subs;
					}
				}else if(!$scope.toEdit){
					$scope.possibleLeaders = sups.concat(subs);
				}
			}
			else if($scope.targetUserName == 'Sucursal'){
				($scope.target.possiblePocs !== undefined && $scope.target.possiblePocs !== null) ? $scope.usefullPocs = $scope.target.possiblePocs : $scope.target.possiblePocs = [];
				($scope.target.actualPoc == undefined || $scope.target.actualPoc == null) ? $scope.target.actualPoc = {} : null;
			}

			if(form) $scope.validForm(form);
		}


		$scope.changeRol = function(form){
			var theRol = $scope.target.rol;
			if(theRol.toLowerCase() == 'administrador' || theRol.toLowerCase() == 'subdirector'){
				$scope.target.haveLeader = $scope.userHasLider = false;
                $scope.target.leaderId = null;
                $scope.target.leaderName = null;
			}else{
				$scope.target.haveLeader = $scope.userHasLider = true;
				if(theRol == 'integrador'){
					$scope.possibleLeaders = angular.copy($scope.specificPocSupervisors);
				}else if (theRol == 'supervisor'){
					$scope.possibleLeaders = angular.copy($scope.pocsSubdirectors);
				}
			}
			console.log(theRol);
			$scope.validateForm(form);
		}

		$scope.contactReferenceChange = function(theID, typeCase){
			if($scope.targetUserName === 'Usuario'){
				$scope.target.leaderId = theID;
			}else if($scope.targetUserName === 'POC'){

				if(typeCase == 'subdirector'){
					($scope.target.subdirector === undefined || $scope.target.subdirector === null) ? ($scope.target.subdirector = {}, $scope.target.subdirector.id = theID) : $scope.target.subdirector.id = theID;

				}else if(typeCase == 'supervisor'){
					($scope.target.supervisor === undefined || $scope.target.supervisor === null) ? ($scope.target.supervisor = {}, $scope.target.supervisor.id = theID) : $scope.target.supervisor.id = theID;

				}

			}
			else if($scope.targetUserName == 'Sucursal'){
				var selectedPoc = $scope.usefullPocs.filter(function(pocI){ return pocI.id == theID;})[0];
				$scope.target.actualPoc.id = theID;
			}
		}

		$scope.fileNameChanged = function(ele){
	        var files = ele.files;

		    // FileReader support
		    if (FileReader && files && files.length) {
		        var fr = new FileReader();
		        fr.readAsDataURL(files[0]);
		        fr.onload = function () {
		            // document.getElementById(outImage).src = fr.result;
		            $scope.userImage = fr.result;
		            $scope. userImageChanged = true;
		            $scope.target.profileImg = $scope.userImage;
		        }
		    }

		    // Not supported
		    else {
		        console.log('not supported');
		    }
		}

		$scope.validateForm = function(form){
			switch($scope.targetUserName){
				case('Usuario'):
					var cellPhoneNumberValid = !form.cellPhoneNumber.$isEmpty(form.cellPhoneNumber.$modelValue),
						phoneNumberValid 	 = !form.phoneNumber.$isEmpty(form.phoneNumber.$modelValue),
						fullName			 = !form.userName.$isEmpty(form.userName.$modelValue),
						liderIDValid		 = ($scope.userHasLider) ? !form.liderID.$isEmpty(form.liderID.$modelValue) : true,
						leaderValid			 = ($scope.userHasLider) ? form.liderName.$valid : true,
						userIDValid			 = !form.userId.$isEmpty(form.userId.$modelValue),
						emailValid			 = form.email.$valid,
						rolValid			 = form.rol.$valid,
						statusValid			 = form.status.$valid;

					// console.log('cellPhoneNumberValid:', cellPhoneNumberValid, 'phoneNumberValid:', phoneNumberValid,'firstNameValid:', firstNameValid,'secondNameValid:', secondNameValid,'liderIDValid:', liderIDValid,'leaderValid:', leaderValid,'userIDValid:', userIDValid,'emailValid:', emailValid,'rolValid:', rolValid,'statusValid:', statusValid);
					$scope.validForm = (cellPhoneNumberValid && phoneNumberValid && fullName && liderIDValid && leaderValid && userIDValid && emailValid && rolValid && statusValid) ? true : false;
					break;
				case('POC'):
					var pocIDValid			 = !form.pocId.$isEmpty(form.pocId.$modelValue),
						pocNameValid		 = !form.pocName.$isEmpty(form.pocName.$modelValue),
						subdirectorIDValid	 = !form.subdirectorID.$isEmpty(form.subdirectorID.$modelValue),
						subdirectorNameValid = form.subdirectorName.$valid,
						supervisorIDValid	 = !form.supervisorID.$isEmpty(form.supervisorID.$modelValue),
						supervisorNameValid  = form.supervisorName.$valid,
						statusValid			 = form.status.$valid;

					$scope.validForm = (pocIDValid && pocNameValid && subdirectorIDValid && subdirectorNameValid && supervisorIDValid && supervisorNameValid && statusValid) ? true : false;
					break;
				case('Centro'):
					var centerIDValid		 = !form.workCenterId.$isEmpty(form.workCenterId.$modelValue),
						centerNameValid		 = !form.workCenterName.$isEmpty(form.workCenterName.$modelValue),
						centerStreet		 = !form.workCenterStreet.$isEmpty(form.workCenterStreet.$modelValue),
						centerZipValid		 = !form.workCenterZipCode.$isEmpty(form.workCenterZipCode.$modelValue),
						centerNeighborValid	 = !form.workCenterNeighborhood.$isEmpty(form.workCenterNeighborhood.$modelValue),
						centerRegionValid	 = !form.workCenterRegion.$isEmpty(form.workCenterRegion.$modelValue),
						centerStateValid	 = !form.workCenterState.$isEmpty(form.workCenterState.$modelValue),
						centerContactNValid	 = !form.workCenterContactName.$isEmpty(form.workCenterContactName.$modelValue),
						centerContactPValid	 = !form.workCenterContactPhone.$isEmpty(form.workCenterContactPhone.$modelValue),
						centerContactEValid	 = form.workCenterEmail.$valid,
						statusValid			 = form.status.$valid;

					$scope.validForm = (centerIDValid && centerNameValid && centerStreet && centerZipValid && centerNeighborValid && centerRegionValid && centerStateValid && centerContactNValid && centerContactPValid && centerContactEValid && statusValid) ? true : false;
					break;
				case('Sucursal'):
					var subsidiaryIDValid	 = !form.subsidiaryId.$isEmpty(form.subsidiaryId.$modelValue),
						subsidiaryNameValid	 = !form.subsidiaryName.$isEmpty(form.subsidiaryName.$modelValue),
						subsidiaryZipValid	 = !form.subsidiaryZipCode.$isEmpty(form.subsidiaryZipCode.$modelValue),
						pocNameValid 		 = form.pocName.$valid,
						statusValid			 = form.status.$valid;

					$scope.validForm = (subsidiaryIDValid && subsidiaryNameValid && subsidiaryZipValid && pocNameValid && statusValid) ? true : false;
					break;
				// case('Permiso'):
				// 	var hola = 'hola';
				// 	break;
			}
		}

		$scope.cancelDialog = function() {
			$mdDialog.cancel();
			$scope.target = {};
			$scope.targetExists = false;
			$scope.justClosing = false;
		};

		$scope.actionForward = function() {
			($scope.justClosing) ? $scope.cancelDialog() : (addNewTarget($scope.toEdit, $scope.target), $scope.justClosing = true);
		};

	}

	function addNewTarget(editting, newGuy) {
		switch($scope.shortText){
			case 'Usuario':
				if(editting){
					pocsService.createPOCMember(newGuy).success(function(res){
						if(res.responseCode.status == 400){newGuy = angular.copy($scope.targetBeforeChanges); alert(res.responseCode.descripcion); $mdDialog.cancel();}else if(res.responseCode.status == 200){$scope.actionSuccess = true;}
					}).error(function(e){
						newGuy = angular.copy($scope.targetBeforeChanges);
						alert(e);
						$mdDialog.cancel();
					})
				}else{
					pocsService.editPOCMember(newGuy).success(function(res){
						if(res.responseCode.status == 200) {$scope.targetUsers.push(newGuy); $scope.actionSuccess = true;}else if(res.responseCode.status == 400){
							$scope.actionSuccess = false;
							$mdDialog.cancel();
						
						}
					})
				}
				break;

			case 'POC':				
				if(editting){
					pocsService.createPOC(newGuy).success(function(res){
						if(res.responseCode.status == 400){newGuy = angular.copy($scope.targetBeforeChanges); alert(res.responseCode.descripcion); $mdDialog.cancel();}else if(res.responseCode.status == 200){$scope.actionSuccess = true;}
					}).error(function(e){
						newGuy = angular.copy($scope.targetBeforeChanges);
						alert(e);
						$mdDialog.cancel();
					})
				}else{
					pocsService.editPOC(newGuy).success(function(res){
						if(res.responseCode.status == 200) {$scope.targetUsers.push(newGuy); $scope.actionSuccess = true;}else if(res.responseCode.status == 400){
							$scope.actionSuccess = false;
							$mdDialog.cancel();
						
						}
					})
				}
				break;

			case 'Sucursal':
				if(editting){
					subsidiariesService.newSubsidiary(newGuy).success(function(res){
						if(res.responseCode.status == 400){newGuy = angular.copy($scope.targetBeforeChanges); alert(res.responseCode.descripcion); $mdDialog.cancel();}else if(res.responseCode.status == 200){$scope.actionSuccess = true;}
					}).error(function(e){
						newGuy = angular.copy($scope.targetBeforeChanges);
						alert(e);
						$mdDialog.cancel();
					})
				}else{
					subsidiariesService.editSubsidiary(newGuy).success(function(res){
						if(res.responseCode.status == 200) {$scope.targetUsers.push(newGuy); $scope.actionSuccess = true;}else if(res.responseCode.status == 400){
							$scope.actionSuccess = false;
							$mdDialog.cancel();
						
						}
					})
				}
				break;
		}
	};

}])
.directive('adminControllArea', function(){
	return {
		restrict: 'E',
		controller: 'AdminControllAreaCtrl',
		templateUrl: folderStructureUrl + 'administrating/controlArea/controlArea.tmp.html'
	}
});