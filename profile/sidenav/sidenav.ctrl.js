var app = angular.module('PayRollWebApp');

app.controller('ProfileLeftSideCtrl', ['$scope', function($scope){
	$scope.onPersonal = false;
	$scope.onTutos = false;
	$scope.onNotifications = false;
	$scope.visibleVideos = {orderSelected: 'newest'};

	$scope.canEdit = false;


	$scope.$on('profileStart', function(e, val){
		switch(val){
			case('Mi Perfil'):
				$scope.onPersonal = true;
				$scope.onTutos = $scope.onNotifications = false;
				break;

			case('Notificaciones'):
				$scope.onNotifications = true;
				$scope.onTutos = $scope.onPersonal = false;
				break;
			
			case('Tutoriales'):
				$scope.onTutos = true;
				$scope.onNotifications = $scope.onPersonal = false;				
				break;
		}
	});

	$scope.$on('dataForSidenav', function(e, val){
		if($scope.onTutos){
			$scope.canEdit = val;
		}
	});


	$scope.createVideo = function(){
		$scope.$emit('openModal', ['newTuto', {}]);
	}

	$scope.orderingVideos = function(criteria){
		// console.log(criteria, $scope.visibleVideos);
		$scope.$emit('tutorialsOrder', criteria);
	}


}])
.directive('profileLeftSide', function(){
	return {
		restrict: 'E',
		controller: 'ProfileLeftSideCtrl',
		templateUrl: 'profile/sidenav/sidenav.tmp.html'
	}
});