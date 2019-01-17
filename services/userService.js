var app = angular.module('PayRollWebApp');
var contextUrl = (sessionStorage.getItem('contextUrl') !== undefined && sessionStorage.getItem('contextUrl') !== null) ? sessionStorage.getItem('contextUrl') : '';


app.factory('userService', ['$http', function($http){
	var service = {
		user: {},
		isUser: false,
		actualUserId: null,
		actualUserToken: null,
		areUserNotifications: false,
		areUserTutorials: false,
		userNotifications: [],
		userTutorials: [],
		endpoints: {
			loginURL: 'src/json/users.json',
			// loginURL: '/login', //for production
			tutorialsURL: '/user-tutorials', //cambiar en producción
			notificationsURL: '/user-tutorials' //cambiar en producción
		},
		login: function(data){
			return $http.get(contextUrl + this.endpoints.loginURL); //cambiar a post
			// return $http.post(contextUrl + this.endpoints.loginURL, data); //cambiar a post
		},
		getUser: function(){
			return angular.copy(this.user);
		},
		getUserToken: function(){
			return this.actualUserToken;
		},
		setUserToken: function(theToken){
			this.actualUserToken = theToken;
		},
		getUserID: function(){
			return this.actualUserId;
		},
		setUserID: function(theId){
			this.actualUserId = theId;
		},
		setActualUser: function(usr){
			this.user = usr;
			this.isUser = true;
		},
		fetchUserNotifications: function(data){
			return $http.get(contextUrl + this.endpoints.notificationsURL, data); //cambiar a $http.post(...) en producción
		},
		fetchUserTutorials: function(data){
			return $http.get(contextUrl + this.endpoints.tutorialsURL, data); //cambiar a $http.post(...) en producción
		},
		getUserNotifications: function(){
			return this.userNotifications;
		},
		getUserTutorials: function(){
			return this.userTutorials;
		},
		areElements: function(target){
			return this[target];
		},
		setUserNotifications: function(notifications){
			this.userNotifications = notifications;
			this.areUserNotifications = true;
		},
		setUserTutorials: function(tutorials){
			return this.userTutorials = tutorials;
			this.areUserTutorials = true;
		},
		checkIfUser: function(){
			return this.isUser;
		},
		clearUser: function(){
			this.isUser = false;
			this.user = {};
		}
	};

	return service;

}]);