angular.module('UoNTimetableApp.services', []).service('UserService', function($http){
	var api = {};
	api.getCourseByUsername = function(username){
		return $http.get('http://uon-timetable-api.jit.su/api/modules/username/' + username);
	};
	return api;
});