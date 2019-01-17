var app = angular.module('PayRollWebApp');

app.directive('validmail', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attrs, ctrl) {
    	if (ctrl && ctrl.$validators.email){
			ctrl.$validators.email = function(modelValue) {

				var mailVal = modelValue,
				idxDot  = 0;

				var idxArroba = (mailVal !== undefined && mailVal !== null) ?  mailVal.indexOf('@') : -1;
				var lastidxArroba = (mailVal !== undefined && mailVal !== null) ?  mailVal.lastIndexOf('@') : -1;

				idxDot = (idxArroba !== -1) ? mailVal.slice(idxArroba).indexOf('.') : -1;

				return (idxArroba > 0 && idxArroba !== mailVal.length - 1 && idxDot > 2 && idxDot !== mailVal.length - 1 && lastidxArroba == idxArroba && !ctrl.$isEmpty(modelValue)) ? true : false;
			};
		}
    }
  };
}).directive('notempty', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attrs, ctrl) {
    	if (ctrl && ctrl.$validators.required){
			ctrl.$validators.required = function(modelValue) {
				return !ctrl.$isEmpty(modelValue);
			};
		}
    }
  };
}).filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
    	// console.log(recordingUrl);
        return $sce.trustAsResourceUrl(recordingUrl);
    };

}]).directive("showPassword", function() { 
    return function linkFn(scope, elem, attrs) {
        scope.$watch(attrs.showPassword, function(newValue) {
            if (newValue) {
                elem.attr("type", "text");
            } else {
                elem.attr("type", "password");
            };
        });
    };
});