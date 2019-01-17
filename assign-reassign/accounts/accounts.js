"use strict";
var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('AssignAccountsCtrl', 
	['$scope', '$mdDialog', '$css', 'accountsService', 'enterprisesService', 'integratorsService', 'accountComplementaryService',
	function($scope, $mdDialog, $css, accountsService, enterprisesService, integratorsService, accountComplementaryService) {
	$scope.enterprisesList = [];

	$scope.integrationAgents = [];
	$scope.accountsList = [];

	$scope.originalAccountsList = [];

	$scope.specificEnterprise = {};

	$scope.lastTopFilter = '';
	$scope.companyFilterName = '';
	$scope.pocFilter = null;

	$scope.initAccountsFunc = function(){
		var integrationsInt,
			enterprisesInt;

		if(accountsService.areElements('allAccounts', null)){
			$scope.originalAccountsList = accountsService.get('allAccounts');
		}else{
			accountsService.fetch();
			integrationsInt = setInterval(function(){
				if(accountsService.areElements('allAccounts', null)){
					$scope.originalAccountsList = accountsService.get('allAccounts');
					clearInterval(integrationsInt);
				}
			}, 5);
		}


		if(enterprisesService.areElements('allEnterprises')){
			$scope.enterprisesList = enterprisesService.get('allEnterprises');
			// console.log('empresas ya cargadas: ', $scope.enterprisesList);
		}else{
			enterprisesService.fetch('allEnterprises');
			
			enterprisesInt = setInterval(function(){
				if(accountsService.areElements('allEnterprises')){
					$scope.enterprisesList = accountsService.get('allEnterprises');
					clearInterval(enterprisesInt);
					// console.log('empresas cargadas después: ', $scope.enterprisesList);
				}
			}, 5);
		}

		$scope.accountsList = angular.copy($scope.originalAccountsList);
	}

	$scope.nothingSelected = true;
	$scope.actionNotAvailable = true;
	$scope.areIntegrators = false;
	$scope.allSelected = false;
	$scope.selectedItems = [];
	$scope.actionText = 'ASIGNAR';

	$scope.$on('filterAccountsType', function(e, val){
		$scope.selectedItems = [];
		// console.log($scope.lastTopFilter, $scope.pocFilter, $scope.companyFilterName);

		if(!$scope.lastTopFilter.length){
			$scope.accountsList = $scope.originalAccountsList.filter(function(acc){
				return (val == 'asignar') ? acc.assigned == false : acc.assigned == true;
			});	
		}else{

			if($scope.lastTopFilter == 'poc'){
				$scope.accountsList = $scope.originalAccountsList.filter(function(acc){
					return acc.pocId == $scope.pocFilter;
				});
			}else if($scope.lastTopFilter == 'company'){
				$scope.accountsList = $scope.originalAccountsList.filter(function(acc){
					return acc.enterprise == $scope.companyFilterName;
				});
			}

			$scope.accountsList = $scope.accountsList.filter(function(acc){
				return (val == 'asignar') ? acc.assigned == false : acc.assigned == true;
			});
		}

		$scope.actionText = val.toUpperCase();
	})

	$scope.$on('pocChange', function(e, val){
		// console.log(val);
		$scope.pocFilter = val;
		$scope.lastTopFilter = 'poc';
		$scope.accountsList = $scope.originalAccountsList.filter(function(acc){
			return acc.pocId == val;
		});

		if(integratorsService.areElements(val)){
			$scope.workWithAgents();
		}else{
			integratorsService.fetch({pocId: val});

			var integratorsInt = setInterval(function(){
				if(integratorsService.areElements(val)){
					$scope.workWithAgents();
					clearInterval(integratorsInt);
				}
			}, 5);
		}

	});

	$scope.workWithAgents = function(){
		$scope.integrationAgents = integratorsService.get();

		$scope.fetchAgentsAccounts();

		$scope.areIntegrators = $scope.nothingSelected = $scope.actionNotAvailable = true;
		$scope.selectedItems = [];
	}

	$scope.fetchAgentsAccounts = function(){

		$scope.integrationAgents.forEach(function(agent){

			accountsService.fetchAccountsPerAgent(agent)
				.success(function(res){
					if(res.responseCode.status == 200){
						

						// var agentsAccounts = res.cuentas; //on production uncomment

						var agentsAccounts = res.data.filter(function(acc){
							return acc.integradorId == agent.userId;
						});

						var accountsThisMonth = accountComplementaryService.accountsThisMonth(agentsAccounts).length;
						var dailyAccounts = accountsThisMonth / 30;
						agent.accountsInfo =  {daily: dailyAccounts, onMonth: accountsThisMonth};

					}else{
						console.log(res.responseCode.descripcion);
					}
				});
		});
	}

	$scope.onChangeCompany = function(){
		$scope.companyFilterName = $scope.specificEnterprise.name;
		$scope.lastTopFilter = 'company';
		$scope.selectedItems = [];

		$scope.accountsList = $scope.originalAccountsList.filter(function(acc){
			return acc.enterprise == $scope.specificEnterprise.name;
		});
	}

	$scope.searchingAccount = function(ev){
		var accountsListEl = document.getElementsByClassName('accounts-list')[0];

		var inputNum = ev.target.value;
		// console.log(inputNum);

        // its a number
        if(inputNum !== undefined){
        	inputNum.toString();

            $scope.accountsList = $scope.originalAccountsList.filter(function(el){
            	var recordNum = (typeof el.contractNumber == 'number') ? el.contractNumber.toString() : el.contractNumber.trim();
            	var keyNum = (typeof el.account == 'number') ? el.account.toString() : el.account.trim();
            	return recordNum.indexOf(inputNum) == 0 || keyNum.indexOf(inputNum) == 0;
            });

            ($scope.accountsList.length > 0) ? accountsListEl.classList.remove('empty-list') : accountsListEl.classList.add('empty-list');

        }else{
        	$scope.accountsList = angular.copy($scope.originalAccountsList)
        }
	}

	$scope.toggle = function (item, list) {
		var idx = list.indexOf(item);
		if (idx > -1) {
			(!$scope.allSelected) ? list.splice(idx, 1) : null;
			$scope.nothingSelected = ($scope.selectedItems.length > 0) ? false : true;
			$scope.actionNotAvailable = ($scope.areIntegrators && !$scope.nothingSelected) ? false : true;
		}
		else {
			list.push(item);
			$scope.nothingSelected = false;
			$scope.actionNotAvailable = ($scope.areIntegrators && !$scope.nothingSelected) ? false : true;
		}
	};



	$scope.accountsDialogShow = function(event, action){
		var actionName = (action == 'delete') ? 'Eliminación' : ($scope.actionText == 'ASIGNAR' ? 'Asignación' : 'Reasignación');
		// console.log('just sending acc: ', $scope.selectedItems);
		$mdDialog.show({
			controller: DialogController,
			templateUrl: folderStructureUrl + 'assign-reassign/dialog/dialog.tmp.html',
			parent: angular.element(document.body),
			locals: {
				agents: $scope.integrationAgents,
				toDoAction: actionName,
				toDoText: $scope.actionText,
				selectedAccounts: $scope.selectedItems
			},
			targetEvent: event,
			clickOutsideToClose:true
		});
	}

	function DialogController($scope, $mdDialog, accountsService, agents, toDoAction, toDoText, selectedAccounts){
		$scope.originalAgents = agents;
		$scope.agents = angular.copy(agents);
		$scope.accountsToWork = selectedAccounts;
		$scope.action = toDoAction;
		$scope.buttonText = toDoText;
		$scope.deleting = ($scope.action == 'Eliminación') ? true : false;
		$scope.agentIsSelected = false;
		$scope.agentSelected = {};
		$scope.lastAccept = false;
		$scope.cancelled = false;
		$scope.folderStructureUrl = folderStructureUrl;


		$scope.hideDialog = function() {
			$mdDialog.hide();
		};

		$scope.selectingAgent = function(e, agent) {
			var element = e.currentTarget;
			var siblings = Array.from(document.getElementsByClassName('integrador-itm'));

			siblings.forEach(function(e){
				e.classList.remove('selected');
			});

			element.classList.add('selected');

			$scope.agentSelected = agent;

			$scope.agentIsSelected = true;

			// console.log(element, agent, $scope.agentSelected);
		};

		$scope.searching = function(ev){
			var agentsList = document.getElementsByClassName('integradores-list')[0];

			var inputTxt = ev.target.value.trim();

	        var isNumber = (!isNaN(inputTxt) && inputTxt !== '') ? true : false;

	        inputTxt = (!isNumber) ? inputTxt.trim().charAt(0).toUpperCase() + inputTxt.trim().slice(1) : inputTxt;

	        // its an empty string
	        if(!isNumber && inputTxt.length < 1){
	            $scope.agents = angular.copy($scope.originalAgents);
	            agentsList.classList.remove('empty-list');

	        // its a string      
	        }else if(!isNumber && inputTxt.length >= 1){

	            $scope.agents = $scope.originalAgents.filter(function(el){
	            	return el.userName.indexOf(inputTxt) == 0;
	            });

	            ($scope.agents.length > 0) ? agentsList.classList.remove('empty-list') : agentsList.classList.add('empty-list');

	        // its a number
	        }else if(isNumber){

	            var agentsMatched = [];

	            $scope.agents = $scope.originalAgents.filter(function(el){
	            	var idNum = (typeof el.userId == 'number') ? el.userId.toString() : el.userId.trim();
	            	return idNum.indexOf(inputTxt) == 0;
	            });

	            ($scope.agents.length > 0) ? agentsList.classList.remove('empty-list') : agentsList.classList.add('empty-list');

	        }
		};

		$scope.cancelDialog = function() {
			$mdDialog.cancel();
			$scope.agentSelected = {};
			$scope.agentIsSelected = false;
			$scope.lastAccept = false;
		};

		$scope.cancellingAction = function() {
			($scope.lastAccept) ? $scope.cancelled = true : $scope.cancelDialog();
		};

		$scope.actionForward = function() {
			($scope.cancelled) ? $scope.cancelDialog() : ($scope.lastAccept ? $scope.doAction() : $scope.lastAccept = true)
		};


		$scope.doAction = function(){
			var actionCase = ($scope.deleting) ? 'ELIMINAR' : $scope.buttonText;
			var dataToSend = {cuentas: $scope.accountsToWork};

			console.log(actionCase);

			switch(actionCase.toLowerCase()){
				case 'asignar':
				case 'reasignar':

					dataToSend.integradorId = $scope.agentSelected.userId;
					
					accountsService.editAccounts(actionCase, dataToSend).success(function(res){
						if(res.responseCode.status == 200){
							removeSelectedFromList(actionCase);
						}else{
							alert(res.responseCode.descripcion);
						}

						$scope.cancelDialog();
					});
					break;

				case 'eliminar':

					accountsService.deleteIntegrations(dataToSend).success(function(res){
						if(res.responseCode.status == 200){
							removeSelectedFromList(actionCase);
						}else{
							alert(res.responseCode.descripcion);
						}

						$scope.cancelDialog();
					});
					break;
			}
		}
	}

	function removeSelectedFromList(toDoCase){

		if(!$scope.allSelected){
			$scope.selectedItems.forEach(function(el, i){
				$scope.accountsList.splice($scope.accountsList.indexOf(el), 1);
			});

			$scope.selectedItems = [];

		}else{
			$scope.selectedItems = $scope.accountsList = [];
		}

		$scope.nothingSelected = $scope.actionNotAvailable = true;
	}

	$scope.exists = function (item, list) {
		return list.indexOf(item) > -1;
	};

	$scope.isChecked = function() {
		return $scope.selectedItems.length === $scope.accountsList.length;
	};

	$scope.toggleAll = function() {
		if ($scope.selectedItems.length === $scope.accountsList.length) {
			$scope.selectedItems = [];
			$scope.nothingSelected = true;
			$scope.nothingSelected = $scope.actionNotAvailable = true;
			$scope.allSelected = false;
		} else if ($scope.selectedItems.length === 0 || $scope.selectedItems.length > 0) {
			$scope.selectedItems = $scope.accountsList;
			$scope.nothingSelected = false;
			$scope.actionNotAvailable = ($scope.areIntegrators && !$scope.nothingSelected) ? false : true;
			$scope.allSelected = true;
		}
	};

}])
.directive('assignControllArea', function(){
	return {
		restrict: 'E',
		templateUrl: folderStructureUrl + 'assign-reassign/accounts/accounts.html',
		controller: 'AssignAccountsCtrl'
	};
});
