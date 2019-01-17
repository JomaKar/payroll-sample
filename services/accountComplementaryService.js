var app = angular.module('PayRollWebApp');


app.factory('accountComplementaryService', ['$http', function($http){
	var service = {
		actualTime: new Date(),
		accountsThisMonth: function(accounts, time){
			var selfObj = this;
			var theMonth = (time) ? time.getMonth() : this.actualTime.getMonth();
			var theYear = (time) ? time.getFullYear() : this.actualTime.getFullYear();

			var accountsOnMonth = accounts.filter(function(acc){
				var accountDate = new Date(acc.date);
				return accountDate.getMonth() == theMonth && accountDate.getFullYear() == theYear;
			});

			return accountsOnMonth;
		},
		enterprisesOnAccounts: function(accounts){
			enterprises = [];
			accounts.forEach(function(acc){
				if(enterprises.indexOf(acc.enterprise) == -1) enterprises.push(acc.enterprise);
			});

			return enterprises;
		},
		accountsRuledPerMonthAndEnterprise: function(accounts){
			var selfObj = this;
			var months 			= [],
				monthsWithInfo  = [],
				monthsNames 	= ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio','Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
				enterprises 	= [];

			accounts.map(function(acc){
				var accountDate = new Date(acc.date),
					dateMonth = accountDate.getMonth(),
					dateYear = accountDate.getFullYear();

				var monthYearTime = new Date(dateYear, dateMonth);

				var timeToCompare = monthYearTime.getTime();
				if(months.indexOf(timeToCompare) == -1) months.push(monthYearTime.getTime()), monthsWithInfo.push({date: monthYearTime, monthName: monthYearTime.getFullYear() + ' ' + monthsNames[monthYearTime.getMonth()]});
			});

			monthsWithInfo.map(function(timeObj){
				var accountsOnMonth = selfObj.accountsThisMonth(accounts, timeObj.date);
				timeObj.accounts = accountsOnMonth; 
			});

			monthsWithInfo.map(function(timeObj){
				timeObj.enterprises = [];
				timeObj.accounts.forEach(function(acc){
					acc.fullDate = new Date(acc.date);
					if(timeObj.enterprises.indexOf(acc.enterprise) == -1) timeObj.enterprises.push(acc.enterprise);
				});
			});

			return monthsWithInfo;

		}
	};

	return service;

}]);