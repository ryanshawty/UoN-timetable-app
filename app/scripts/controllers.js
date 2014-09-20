'use strict';
angular.module('UoNTimetableApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $localForage, UserService, $state, $rootScope, _, $ionicActionSheet){
  var currentDate = new Date();
  // Init scope variables
  $scope.setupData = {};
  $scope.modules = [];
  $scope.date = currentDate.toDateString();
  $scope.userData = {};
  // Set persistant binding
  $localForage.bind($scope, 'setupData.username'); 
  $localForage.bind($scope, 'userData'); 
  $localForage.bind($scope, 'days');
  $localForage.bind($scope, 'modules');

  $localForage.getItem('days').then(function(data){
    $scope.days = data;
    if(typeof data === 'undefined' || data === ''){
      $scope.setup();
    }else{
      loadCurrentDay(data);
    }
  });

  $scope.checkSetup = function(){
    if($scope.setupData.username === '' || typeof $scope.setupData.username === 'undefined'){
      $scope.setup();
    }
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    if(toState.name === 'app.home' && ($scope.setupData.username === '' || typeof $scope.setupData.username === 'undefined')){
      $scope.setup();
    }
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/setup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.showModuleCardSettings = function(){
    var moduleItem = this.module;
    var hideSheet = $ionicActionSheet.show({
      buttons: [],
      destructiveText: 'Disable',
      titleText: '<h4>Module settings</h4>',
      cancelText: 'Cancel',
      destructiveButtonClicked: function() {
        console.log(moduleItem);
        _.find($scope.modules, {code: moduleItem.code}).enabled = false;
        return true;
      },
      buttonClicked: function(index) {
        return true;
      }
    });
  };

  // Triggered in the login modal to close it
  $scope.closeSetup = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.setup = function() {
    $scope.modal.show();
  };

  var loadCurrentDay = function(days){
    var startWeek = new Date(2014, 8, 15);
    // var currentWeek = Math.round((currentDate.getDay() - startWeek.getDay())/7);

    $scope.currentWeek = Math.round(((currentDate - (86400000 * currentDate.getDay())) - startWeek)/ 604800000);

    var weekday = new Array(7);
    weekday[0]=  'Sunday';
    weekday[1] = 'Monday';
    weekday[2] = 'Tuesday';
    weekday[3] = 'Wednesday';
    weekday[4] = 'Thursday';
    weekday[5] = 'Friday';
    weekday[6] = 'Saturday';

    // $scope.currDay = _.findWhere(days, {day_name: weekday[currentDate.getDay()]});
    days.forEach(function(day){
      if(day.day_name === weekday[currentDate.getDay()]){
        $scope.currDay = day;
      }
    });
    if(typeof $scope.currDay === 'undefined') return;
  };

  $scope.nextDay = function(){
     // var currentDate = new Date();
     $scope.currDay = {};
     currentDate.setDate(currentDate.getDate() + 1);
     $scope.date = currentDate.toDateString();
     loadCurrentDay($scope.days);
  };

  $scope.previousDay = function(){
    $scope.currDay = {};
    currentDate.setDate(currentDate.getDate() - 1);
    $scope.date = currentDate.toDateString();
    loadCurrentDay($scope.days);
  };

  // Perform the login action when the user submits the login form
  $scope.doSetup = function() {
    $ionicLoading.show({
      template: 'Finding course...'
    });

    UserService.getCourseByUsername($scope.setupData.username).success(function(data){
      $scope.userData = data;

      $ionicLoading.hide();
      $ionicLoading.show({
        template: 'Loading modules...'
      });
      
      
      UserService.getModules(data.id).success(function(data){
        $scope.modules = [];
        var codes = [];
        data.days.forEach(function(day){
          day.modules.forEach(function(module){
            if(!_.contains(codes, module.code)){
              codes.push(module.code);
              module.enabled = true;
              $scope.modules.push(module);
            }
          });
        });

        $scope.days = data.days;
        $ionicLoading.hide();
        //$state.go('app.home');
        //$scope.closeSetup();
        loadCurrentDay($scope.days);
      });
    });
  };

  $scope.clearUsername = function(){
      $scope.setupData.username = '';
      $scope.userData = '';
      $scope.days = '';
      $scope.modules = [];
      var popup = $ionicPopup.alert({
        title: 'Cleared data',
        template: 'Your data has been cleared!'
      });
    };
})