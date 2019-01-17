"use strict";
var app = angular.module('PayRollWebApp');

app.controller('ProfileMainCtrl', [
    '$scope', '$routeParams',  '$timeout', 'userService', '$mdDialog',
    function ($scope, $routeParams,  $timeout, userService, $mdDialog){
        $scope.profileSection = '';
        $scope.arePermissions = false;

        $scope.startingProfile = function(){
            var userInt;
            (userService.checkIfUser()) ? $scope.distributeInitialData() : userInt = setInterval(function(){ if(userService.checkIfUser()) $scope.distributeInitialData(), clearInterval(userInt); }, 5);
        }

        $scope.distributeInitialData = function(){
            var dataForSidePanel;
            var dataForMainPanel;

            switch($scope.profileSection){
                case('Mi Perfil'):
                  dataForMainPanel = userService.getUser();
                  dataForSidePanel = 'nada';
                  break;

                case('Notificaciones'):
                  dataForMainPanel = userService.getUserNotifications();
                  dataForSidePanel = 'nada';
                  break;
                
                case('Tutoriales'):
                  dataForMainPanel = userService.getUserTutorials();
                  dataForSidePanel = $scope.arePermissions = userService.getUserBasicInfo()['credentials']['videoEdit'];
                  // console.log('switch', dataForMainPanel);
                  break;
            }

            $timeout(function(){
                $scope.$broadcast('dataForSidenav', dataForSidePanel);
                $scope.$broadcast('dataForMainPanel', dataForMainPanel);
            }, 45);
        }

        $scope.$on('$viewContentLoaded', function(){
          var text = ($routeParams.profileSection == 'mi-perfil') ? 'Mi Perfil' : $routeParams.profileSection;
          $scope.profileSection = text.charAt(0).toUpperCase() + text.substring(1);
          $scope.startingProfile();
          
          $timeout(function(){
            $scope.$broadcast('profileStart', $scope.profileSection);
          }, 30);

        });


        $scope.$on('tutorialsOrder', function(e, val){
          $scope.$broadcast('tutorialsOrderDecided', val);
        })

        $scope.$on('openModal', function(e, val){
            // console.log(val);
            var videoInfo = val[1];
            $scope.profileDialogShow(val[0], videoInfo);
        })


        $scope.profileDialogShow = function(action, target){
          $scope.arePermissions
          var textOnHeader = (!$scope.arePermissions) ? 'Tutorial' : (action == 'newTuto' ? 'Nuevo video' : 'Editar video');
          var baseActionText = (action == 'seeTutorial') ? 'GUARDAR CAMBIOS' : 'CREAR VIDEO';
          var targetToSend = target;
          var caseAction = (!$scope.arePermissions) ? 0 : (action == 'seeTutorial' ? 1 : 2);

          $mdDialog.show({
            controller: DialogController,
            templateUrl: 'profile/dialog/dialog.tmp.html',
            parent: angular.element(document.body),
            locals: {
              sentTarget: targetToSend,
              textOnTop: textOnHeader,
              textOnButton: baseActionText,
              actionType: caseAction
            },
            // targetEvent: event,
            clickOutsideToClose:true
          });
        }

        function DialogController($scope, $mdDialog, sentTarget, textOnTop, textOnButton, actionType){
            $scope.target = sentTarget;
            $scope.headerText = textOnTop;
            $scope.buttonText = textOnButton;
            $scope.actionConfirmationText = (actionType == 2) ? 'creado' : 'editado';

            $scope.deleting = false;
            $scope.secondStepEdit = false;

            $scope.validForm = (actionType == 1) ? true : false;

            $scope.availableViews = [
                {
                  case: 'onlySee',
                  viewUrl: 'profile/dialog/views/videoSee.tmp.html'
                },
                {
                  case: 'editOrCreateVideo',
                  viewUrl: 'profile/dialog/views/videoForm.tmp.html'
                }
            ];

            $scope.contentView = (actionType < 2) ? $scope.availableViews[0]['viewUrl'] : $scope.availableViews[actionType - 1]['viewUrl']

            $scope.justClosing = false;

            $scope.basicSetup = function(){
                if($scope.target.resumeImg !== undefined && $scope.target.videoUrl.length > 0 && $scope.target.videoUrl !== undefined && $scope.target.videoUrl.length > 0){
                    document.getElementById('imageNameHolder').innerHTML = $scope.target.resumeImg;
                    document.getElementById('videNameHolder').innerHTML = $scope.target.videoUrl;
                }
            }

            $scope.fileNameChanged = function(ele, type){
                var files = ele.files;

                // console.log(ele, files[0]);

                var inputContainer = (type == 'resumeImg') ? document.getElementById('imageNameInputContainer') : document.getElementById('videoNameInputContainer');
                var elementTarget = (type == 'resumeImg') ? document.getElementById('imageNameHolder') : document.getElementById('videNameHolder');
                elementTarget.innerHTML = files[0].name;
                inputContainer.classList.add('md-input-has-value');

                // FileReader support
                if (FileReader && files && files.length) {
                    var fr = new FileReader();
                    fr.readAsDataURL(files[0]);
                    fr.onload = function (event) {
                        // console.log(fr);
                        $scope.target[type] = event.target.result;

                        if((window.URL || window.webkitURL) && type == 'videoUrl'){
                            window.URL = window.URL || window.webkitURL;

                            var video = document.createElement('video');
                            video.preload = 'metadata';

                            video.onloadedmetadata = function() {
                              window.URL.revokeObjectURL(video.src);
                              var formatedDuration = video.duration / 60;
                              formatedDuration = formatedDuration.toString();
                              console.log(formatedDuration, formatedDuration.substring(0, 4).replace('.', ':'));
                              $scope.target.duration = formatedDuration.substring(0, 4).replace('.', ':');
                            }

                            video.src = URL.createObjectURL(files[0]);
                        }
                    }
                }

                // Not supported
                else {
                    console.log('not supported');
                }
            }

            $scope.validateForm = function(form){
                var videoTitle = !form.videoTitle.$isEmpty(form.videoTitle.$modelValue),
                    videoName    = !form.videoName.$isEmpty(form.videoName.$modelValue),
                    imageName     = !form.imageName.$isEmpty(form.imageName.$modelValue),
                    videoDescription = !form.videoDescription.$isEmpty(form.videoDescription.$modelValue);

                  // console.log('cellPhoneNumberValid:', cellPhoneNumberValid, 'phoneNumberValid:', phoneNumberValid,'firstNameValid:', firstNameValid,'secondNameValid:', secondNameValid,'liderIDValid:', liderIDValid,'liderNameValid:', liderNameValid,'userIDValid:', userIDValid,'emailValid:', emailValid,'rolValid:', rolValid,'statusValid:', statusValid);
                $scope.validForm = (videoTitle && videoName && imageName && videoDescription) ? true : false;
            }

            $scope.cancelDialog = function() {
                $mdDialog.cancel();
                $scope.target = {};
                $scope.justClosing = $scope.secondStepEdit = $scope.deleting = false;
            };

            $scope.deleteVideo = function(){
                $scope.actionConfirmationText = 'eliminado';
                $scope.justClosing = $scope.deleting = true;
            }

            $scope.actionForward = function(act) {
              // console.log('actionForward', act);
              
              if(act == undefined){

                  if($scope.justClosing){
                      ($scope.deleting) ? 
                            handleActionOnTarget($scope.target, 'eliminar')
                                        : (
                            $scope.secondStepEdit ? handleActionOnTarget($scope.target, 'editar') : handleActionOnTarget($scope.target, 'crear')
                                          );

                      $scope.cancelDialog();
                  }else{
                    $scope.justClosing = true;
                  }
              
              }else if(act == 'toEdit'){
                  $scope.secondStepEdit = true;                
                  $scope.contentView = $scope.availableViews[1]['viewUrl'];
              
              }
            
            };


            $scope.setVideoHeight = function(itms){
              var videoItm = document.getElementsByClassName('video-wrapper')[0];
              var oneWidth = videoItm['clientWidth'];
              // console.log(videoItm, oneWidth);
              videoItm.height = (oneWidth * .621) + 'px';
            }

            window.addEventListener('resize', function(){
              $scope.setVideoHeight();
            });
        }

        function handleActionOnTarget(theTarget, actionToDo) {
            var dataToEmit = {action: actionToDo, target: theTarget};
            $scope.$broadcast('actionFromModal', dataToEmit);
        };
    }
  ]);