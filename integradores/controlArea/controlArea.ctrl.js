var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('IntegradoresControllAreaCtrl', ['$scope', '$mdDialog','controlPanelService', 'accountsService', 'accountComplementaryService', 'integratorsService',
	function($scope, $mdDialog, controlPanelService, accountsService, accountComplementaryService, integratorsService){
	$scope.onlyShowActives = false;
	$scope.targetUsers = [];
	$scope.selectedElements = [];
	$scope.usersPoc = {};
	$scope.usersAvailable = false;

	$scope.orderOptions = {
		moreInt: {criteria: 'integrations.success', reverse: true},
		moreAssigned: {criteria: 'integrations.total', reverse: true},
		moreWithoutDone: {criteria: 'integrations.pending', reverse: true},
		lessInt: {criteria: 'integrations.success', reverse: false},
		lessAssigned: {criteria: 'integrations.total', reverse: false},
		lessWithoutDone: {criteria: 'integrations.pending', reverse: false}
	};

	$scope.actualOrderCriteria = {criteria: 'integrations.success', reverse: true};

	$scope.$on('usersToWorkWith', function(e, val){
		$scope.usersAvailable = true;
		$scope.targetUsers = angular.copy(val);
		$scope.gatherAgentsAccountsInfo($scope.targetUsers);
		$scope.selectedElements = angular.copy($scope.targetUsers);
		$scope.gatherAgentsAccountsInfo($scope.selectedElements);
	});


	$scope.gatherAgentsAccountsInfo = function(agents){
		agents.map(function(ag){
			accountsService.fetchAccountsPerAgent(ag).success(function(res){
				if(res.responseCode.status == 200){
					ag.isIntegrationsInfo = true;
					var accountsOfAgent = angular.copy(res.data);
					var accountsRuledPerMonth = accountComplementaryService.accountsRuledPerMonthAndEnterprise(accountsOfAgent);
					ag.integrationsInfo = accountsRuledPerMonth;
					ag.allAccounts = angular.copy(res.data);
					ag.allEnterprises = accountComplementaryService.enterprisesOnAccounts(ag.allAccounts);
					var monthsAvailable;

				}else if(res.responseCode.status == 400){
					ag.isIntegrationsInfo = false;
				}
			}).error(function(){
				ag.isIntegrationsInfo = false;
			})
		})
	}

	$scope.$on('filteringCriteria', function(e, val){
		$scope.actualOrderCriteria = $scope.orderOptions[val];
		// console.log('from filtering', val, $scope.actualOrderCriteria);
	});

	$scope.$on('theActualPoc', function(e, val){
		$scope.usersPoc = val;
	});

	$scope.searching = function(ev){
		var agentsList = document.getElementsByClassName('users-target-list')[0];

		var inputTxt = ev.target.value.trim();

        var isNumber = (!isNaN(inputTxt) && inputTxt !== '') ? true : false;

        inputTxt = (!isNumber) ? inputTxt.trim().charAt(0).toUpperCase() + inputTxt.trim().slice(1) : inputTxt;

        // its not a number and its an empty string
        if(!isNumber && inputTxt.length < 1){
            $scope.selectedElements = angular.copy($scope.targetUsers);
            agentsList.classList.remove('empty-list');

        // its not a number but its not an empty string      
        }else if(!isNumber && inputTxt.length >= 1){

            $scope.selectedElements = $scope.targetUsers.filter(function(el){
            	return el.userName.indexOf(inputTxt) == 0;
            });

            ($scope.selectedElements.length > 0) ? agentsList.classList.remove('empty-list') : agentsList.classList.add('empty-list');

        // its a number
        }else if(isNumber){

            var agentsMatched = [];

            $scope.selectedElements = $scope.targetUsers.filter(function(el){
            	var idNum = (typeof el.userId == 'number') ? el.userId.toString() : el.userId.trim();
            	return idNum.indexOf(inputTxt) == 0;
            });

            ($scope.selectedElements.length > 0) ? agentsList.classList.remove('empty-list') : agentsList.classList.add('empty-list');

        }
	};

	$scope.changeElementsDependingOnActivity = function(onlyActives){
		controlPanelService.changeElementsDependingOnActivity(onlyActives);
	}


	$scope.integradoresDialogShow = function(event, target){
		var targetToSend = target;
		// console.log(target.integrations);

		$mdDialog.show({
			controller: DialogController,
			templateUrl: 'integradores/dialog/dialog.tmp.html',
			parent: angular.element(document.body),
			locals: {
				sentTarget: targetToSend,
				thePOC: $scope.usersPoc,
				integratorsService: integratorsService
			},
			targetEvent: event,
			multiple: true,
			clickOutsideToClose:true
		});
	}

	function DialogController($scope, $mdDialog, sentTarget, thePOC, integratorsService){
		$scope.target = sentTarget;
		$scope.actualPOC = thePOC;
		$scope.availableEnterprises = [];
		$scope.filteredIntegrations = [];
		$scope.workedMonths = [];
		$scope.workMonthSelected = {};
		$scope.selectedEnterprise = {};

		$scope.resultLabels = ["Completados", "Sin iniciar", "Pendientes"];
	    $scope.resultColors = ["#56d27e", "#dd1f26", "#47aafd"];
	    $scope.agentWorkStats = [$scope.target.integrations.success, $scope.target.integrations.notStarting, $scope.target.integrations.pending];

	    $scope.totalIntegrations = $scope.target.integrations.success + $scope.target.integrations.notStarting + $scope.target.integrations.pending;

		$scope.isMessage = false;
		$scope.message = {title: '', body: ''};
		$scope.isMessageDialog = false;

	    $scope.initialSetup = function(){
	    	$scope.availableEnterprises = ($scope.target.isIntegrationsInfo) ? angular.copy($scope.target.allEnterprises) : [];
			$scope.workedMonths = ($scope.target.isIntegrationsInfo) ? angular.copy($scope.target.integrationsInfo) : [];
			$scope.filteredIntegrations = ($scope.target.isIntegrationsInfo) ? angular.copy($scope.target.allAccounts) : [];
	    }

	    $scope.isFilterByMonthDone = false;
	    $scope.workingMonthSelection = function(month){

	    	$scope.totalIntegrations = month.accounts.length;
	    	$scope.availableEnterprises = month.enterprises;
	    	$scope.filteredIntegrations = month.accounts;

	    	var availableStatus = ['success', 'notStarting', 'pending'];
	    	availableStatus.forEach(function(status, idx){
	    		var accountsWithThatStatus = month.accounts.filter(function(acc){
	    			return acc.status == status;
	    		});
	    		$scope.agentWorkStats[idx] = accountsWithThatStatus.length;
	    	});

	    	$scope.isFilterByMonthDone = true;
	    }

	    $scope.filteringByEnterprise = function(theEnterprise){
	    	if($scope.isFilterByMonthDone){
	    		$scope.filteredIntegrations = $scope.workMonthSelected.month.accounts.filter(function(ac){
		    		return ac.enterprise == theEnterprise;
		    	});
	    	}else{
	    		$scope.filteredIntegrations = $scope.target.allAccounts.filter(function(ac){
		    		return ac.enterprise == theEnterprise;
		    	});
	    	}
	    };

		$scope.cancelDialog = function() {
			$mdDialog.cancel();
			$scope.target = {};
		};

		// message

		$scope.cancelDialogMessageDialog = function(e) {
			var target = e.target;
			$scope.isMessage = false;
			$scope.isMessageDialog = (target.classList.contains('message-full-width-wrapper')) ? false : true;
			$scope.message = {title: '', body: ''};
		};

		$scope.sendMessage = function() {
			integratorsService.sendMessage($scope.target.userId, $scope.message);
			$scope.isMessageDialog = false;
		};

		$scope.openMessageDialog = function(event, theAgent){
			$scope.isMessageDialog = true;
		}

	}

}])
.directive('integradoresControllArea', function(){
	return {
		restrict: 'E',
		controller: 'IntegradoresControllAreaCtrl',
		templateUrl: folderStructureUrl + 'integradores/controlArea/controlArea.tmp.html'
	}
});