var app = angular.module('PayRollWebApp');

app.controller('ProfileControllAreaCtrl', ['$scope', 'userService',
	function($scope, userService){
	$scope.originalTutosColl = [];
	$scope.tutorialsColl = [];

	$scope.onPersonal = false;
	$scope.onTutos = false;
	$scope.onNotifications = false;

	$scope.oneHeight = '';

	$scope.orderOptions = {
		newest: {criteria: 'creationDate', reverse: true},
		oldest: {criteria: 'creationDate', reverse: false}
	};

	$scope.actualOrderCriteria = {criteria: 'creationDate', reverse: true};

	$scope.setHeight = function(itms){
		var theItms = (itms) ? itms : Array.from(document.getElementsByClassName('resume-img-div'));
		var oneWidth = theItms[0]['clientWidth'];
		// console.log('what', theItms);

		theItms.forEach(function(itm){
			itm.style.height = oneWidth/2 + 'px';
		});
	}

	window.addEventListener('resize', function(){
		$scope.setHeight(null);
	});

	$scope.$on('profileStart', function(e, val){
		var userInt;

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

	$scope.$on('dataForMainPanel', function(e, val){
		if($scope.onTutos){
			$scope.originalTutosColl = val;
			$scope.tutorialsColl = angular.copy($scope.originalTutosColl);
			// console.log(val);

			var itms;

			var itmsInterval = setInterval(function(){
				itms = Array.from(document.getElementsByClassName('resume-img-div'));
				if(itms.length > 0) clearInterval(itmsInterval), $scope.setHeight(itms);
			}, 5);
		}
	});

	$scope.$on('tutorialsOrderDecided', function(e, val){
		if(val !== 'new' && val !== 'seen'){ 
			$scope.tutorialsColl = $scope.originalTutosColl.slice();
			$scope.actualOrderCriteria = $scope.orderOptions[val];
		}else if(val == 'new'){
			$scope.tutorialsColl = $scope.originalTutosColl.filter(function(vid){
				return vid.isNew === true;
			});
		}else if(val == 'seen'){
			$scope.tutorialsColl = $scope.originalTutosColl.filter(function(vid){
				return vid.isNew === false;
			});
		}
		setTimeout(function() { $scope.setHeight(null); }, 10);

	});

	$scope.$on('actionFromModal', function(e, val){

		if(val.action == 'eliminar'){
			$scope.originalTutosColl.splice($scope.originalTutosColl.indexOf(val.target), 1);
			$scope.tutorialsColl = $scope.originalTutosColl.slice();
		}else if(val.action == 'crear'){
			val.target.isNew = true;
			val.target.creationDate = JSON.stringify(new Date());
			$scope.originalTutosColl.push(val.target);
			$scope.tutorialsColl = $scope.originalTutosColl.slice();
		
		}else if(val.action == 'editar'){
			val.target.isNew = false;
			var indexOfTuto = $scope.originalTutosColl.findIndex(function(tuto){
				return tuto.id == val.target.id;
			});

			$scope.originalTutosColl[indexOfTuto] = val.target;
			$scope.tutorialsColl = $scope.originalTutosColl.slice();
		}

		setTimeout(function() { $scope.setHeight(null); }, 10);

	});


	$scope.seeTutorial = function(tutorial){
		tutorial.isNew = false;
		$scope.$emit('openModal', ['seeTutorial', tutorial]);
	}

}])
.directive('profileControllArea', function(){
	return {
		restrict: 'E',
		controller: 'ProfileControllAreaCtrl',
		templateUrl: 'profile/controlArea/controlArea.tmp.html'
	}
});