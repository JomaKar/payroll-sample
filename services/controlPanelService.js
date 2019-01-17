var app = angular.module('PayRollWebApp');


app.factory('controlPanelService', function(){
	var service = {
		changeElementsDependingOnActivity: function(onlyActives){
			var activeElements = Array.from(document.getElementsByClassName('activeTarget'));
			var unactiveElements = Array.from(document.getElementsByClassName('noActiveTarget'));

			if(onlyActives){

				activeElements.forEach(function(el){
					el.classList.remove('no-display');
				});

				unactiveElements.forEach(function(el){
					el.classList.add('no-display');
				});

			}else{

				unactiveElements.forEach(function(el){
					el.classList.remove('no-display');
				});

				activeElements.forEach(function(el){
					el.classList.add('no-display');
				});
			}
		}
	}

	return service;

});