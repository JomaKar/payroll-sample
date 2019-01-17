var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('DetailsController', ['$scope', '$mdDialog', 'locationService',
	function($scope, $mdDialog, locationService) {
	$scope.workingMonth = {};
	$scope.integrationsToSee = 0;
	$scope.filterOrder = false;
	$scope.showLocation = false;
	$scope.posibleIntegrations = [
									{text: 'De la más reciente a la más antigua', optionVal: 1},
									{text: 'De la más antigua a la más reciente', optionVal: 2}
								];
	$scope.resultLabels = ["Completados", "Sin iniciar", "Pendientes"];
    $scope.resultColors = ["#56d27e", "#dd1f26", "#47aafd"];
    $scope.availableIntegrations = [];

    $scope.totalIntegrations = $scope.agentDetails.integrations.success + $scope.agentDetails.integrations.pending + $scope.agentDetails.integrations.notStarting;
    $scope.agentWorkStats = [$scope.agentDetails.integrations.success, $scope.agentDetails.integrations.notStarting, $scope.agentDetails.integrations.pending];

    $scope.availableIntegrations = $scope.agentDetails.allAccounts;
    $scope.availableMonths = $scope.agentDetails.accountsInfo;
    $scope.showLocation = false;
	$scope.filterOrder = false;


	$scope.workingMonthSelection = function(month){

    	$scope.availableIntegrations = month.accounts.filter(function(acc){
    		return acc.status == 'success';
    	});
    	console.log('month.accounts', month.accounts);
    	$scope.totalIntegrations = month.accounts.length;

    	var availableStatus = ['success', 'notStarting', 'pending'];
    	availableStatus.forEach(function(status, idx){
    		var accountsWithThatStatus = month.accounts.filter(function(acc){
    			return acc.status == status;
    		});
    		$scope.agentWorkStats[idx] = accountsWithThatStatus.length;
    	});

    }

	$scope.centerNow = function(integrationInfo, img){
		// UNCOMMENT AND WORK IT WHEN LOCATIONS AVAILABLE

		var dataToSend = {
			latitude: integrationInfo.latitude, 
			longitude: integrationInfo.longitude,
			markerId: integrationInfo.date + integrationInfo.enterprise
		};

		locationService.setLocations([dataToSend]);
		locationService.showSimplestLocation();

	}

	$scope.showLocationsFn = function(theLocations){
		// UNCOMMENT AND WORK IT WHEN LOCATIONS AVAILABLE
		console.log('theLocations', theLocations);
		$scope.showLocation = !$scope.showLocation;
		if($scope.showLocation){
			locationService.setLocations([theLocations]);
			locationService.showLocations(null, 'complexMarker', null);
			locationService.showLocations(null, 'complexMarker', 
				{
					profileImg: $scope.agentDetails.profileImg, 
					userId: $scope.agentDetails.userId, 
					addressName: $scope.agentDetails.addressName, 
					latitude: $scope.agentDetails.latitude, 
					longitude: $scope.agentDetails.longitude
				});
		}
	}

	$scope.visibleIntegrationsExposer = function(valueN){
		$scope.filterOrder = (valueN > 1) ? true : false;
		// console.log($scope.agentDetails, 'from details', $scope.integrationsToSee, $scope.filterOrder, valueN);
	}

	$scope.openMessageDialog = function(event, theAgent){
		// console.log(theAgent);

		var personName = theAgent.userName;
		$scope.messagedAgent = theAgent;
		$mdDialog.show({
			controller: MessDialogController,
			templateUrl: 'location-pocs/dialog/dialog.tmp.html',
			parent: angular.element(document.body),
			locals: {
				agentName: personName,
				agent: $scope.messagedAgent
			},
			targetEvent: event,
			clickOutsideToClose:true
		});
	}

	function MessDialogController($scope, $mdDialog, agentName, agent){
		$scope.agentSelected = agent;
		$scope.agentsName = agentName;
		$scope.isMessage = false;
		$scope.message = {title: '', body: ''};

		$scope.hideDialog = function() {
			$mdDialog.hide();
		};

		$scope.cancelDialog = function() {
			$mdDialog.cancel();
			$scope.isMessage = false;
		};

		$scope.sendMessage = function() {
			// console.log('In the future will send a message', $scope.message);
			$mdDialog.cancel();
		};

	}

}])
.directive('agentDetails', function(){
	return {
		restrict: 'E',
		templateUrl: folderStructureUrl + 'location-pocs/agent-details/agent-details.html',
		controller: 'DetailsController',
		css: folderStructureUrl + 'css/agent-details.css'
	};
});