var app = angular.module('PayRollWebApp');
var folderStructureUrl = (sessionStorage.getItem('folderStructureUrl') !== undefined && sessionStorage.getItem('folderStructureUrl') !== null) ? sessionStorage.getItem('folderStructureUrl') : '';

app.controller('LocationSideNavLeftCtrl', [
    '$scope',
    '$mdSidenav',
    '$log',
    'locationService',
    '$mdDialog',
    'geographicElementsService',
    'pocsService',
    'integratorsService',
    'accountsService',
    'accountComplementaryService',
    function ($scope, $mdSidenav, $log, locationService, $mdDialog, geographicElementsService, pocsService, integratorsService, accountsService, accountComplementaryService) {
      $scope.targetsAvailable = false;
      $scope.hideShowInfoPoc = true;
      $scope.keyboardArrow = "keyboard_arrow_down";
      $scope.agentsOrder = false;
      $scope.agentsPossibleOrders = [
                {
                  text: 'A-Z', val: false
                },
                {
                  text: 'Z-A', val: true
                }
            ];

      $scope.orderedAgents = [];
      $scope.orderedAgentsBackup = [];

      $scope.pocAgents = [];
      $scope.agentsWithoutOrder = [];

      $scope.targetsFirstSelect = [];
      $scope.pocs = [];
      $scope.actualPoc = {};


      $scope.initFunc = function(){
          var statesInt;
          if(geographicElementsService.areElements('statesAvailable')){
              $scope.targetsFirstSelect = geographicElementsService.get('statesAvailable');
          }else{
             geographicElementsService.fetch('statesAvailable');
             statesInt = setInterval(function(){
               if(geographicElementsService.areElements('statesAvailable')) $scope.targetsFirstSelect = geographicElementsService.get('statesAvailable'), clearInterval(statesInt);
             }, 5);
          }

          var pocsInt;
          if(pocsService.areElements('allPOCs')){
            $scope.pocs = pocsService.get('allPOCs');
          }else{
            pocsService.fetch('allPOCs');
            pocsInt = setInterval(function(){
              if(pocsService.areElements('allPOCs')) $scope.pocs = pocsService.get('allPOCs'), clearInterval(pocsInt);
            }, 5);
          }
      };

      $scope.statesSelected = {};
      $scope.onChangeEstado = function(stateName){
        $scope.statesSelected.name = stateName;
        var data = { estado: $scope.statesSelected.name};

        var pocsInt;
        if(pocsService.areElements('pocsByState', $scope.statesSelected.name)){
          $scope.pocs = pocsService.get('pocsByState');
        }else{
          pocsService.fetch('pocsByState', data);
          pocsInt = setInterval(function(){
            if(pocsService.areElements('pocsByState', $scope.statesSelected.name)){
              $scope.pocs = pocsService.get('pocsByState');
              clearInterval(pocsInt);
            }
          }, 5);
        }         
      };

      $scope.pocSelected = {};
      $scope.onChangePocs = function(theId){
          $scope.pocSelected.id = theId;
          $scope.actualPoc = $scope.pocs.filter(function(thePoc){
              return thePoc.id == $scope.pocSelected.id;
          })[0];

          if(integratorsService.areElements($scope.pocSelected.id)){
            $scope.workWithAgents();
          }else{
            integratorsService.fetch({pocId: $scope.pocSelected.id});

            var integratorsInt = setInterval(function(){
              if(integratorsService.areElements($scope.pocSelected.id)){
                $scope.workWithAgents();
                clearInterval(integratorsInt);
              }
            }, 5);
          }
      };

      $scope.workWithAgents = function(){
          $scope.pocAgents = integratorsService.get();
          $scope.targetsAvailable = true;

          // USEFULL WHEN LOCATIONS WORK
          
          locationService.setLocations($scope.pocAgents);
          locationService.showLocations(null, 'simpleMarker', null);
          

          $scope.agentsWithoutOrder = angular.copy($scope.pocAgents);

          $scope.gatherAccountsInfo($scope.pocAgents);
          $scope.gatherAccountsInfo($scope.agentsWithoutOrder);

          $scope.orderAgentsOnStart($scope.pocAgents);
      };

      $scope.gatherAccountsInfo = function(agents){
          agents.map(function(ag){
              accountsService.fetchAccountsPerAgent(ag).success(function(res){
                if(res.responseCode.status == 200){
                  ag.allAccounts = angular.copy(res.data);
                  ag.accountsInfo = accountComplementaryService.accountsRuledPerMonthAndEnterprise(angular.copy(res.data));
                }
              });
          });
      }

      $scope.orderAgentsOnStart = function(allTheAgents){

          $scope.orderedAgents = [];

          allTheAgents.forEach(function(agent, i){
              var name = agent.userName.trim();
              var agentFirstLetter = name.charAt(0);

              var existedObject = $scope.orderedAgents.filter(function(obj){
                return obj.letter == agentFirstLetter.toUpperCase();
              });

              // console.log(existedObject, agentFirstLetter);

              if(existedObject.length < 1){

                  var newLetterRecord = {letter: agentFirstLetter, agents: []};
                  newLetterRecord.agents.push(agent);
                  $scope.orderedAgents.push(newLetterRecord);

              }else{

                  var indexOfRecord = $scope.orderedAgents.indexOf(existedObject[0]);
                  var letterRecordedOnArray = $scope.orderedAgents[indexOfRecord];
                  letterRecordedOnArray['agents'].push(agent);

              }
          });

          $scope.orderedAgentsBackup = angular.copy($scope.orderedAgents);

          // console.log($scope.orderedAgents);
      }

      $scope.searchAgent = function(ev){
        var agentsList = document.getElementsByClassName('left-side-agents-list')[0];

        var inputTxt = ev.target.value.trim();

        var isNumber = (!isNaN(inputTxt) && inputTxt !== '') ? true : false;

        inputTxt = (!isNumber) ? inputTxt.trim().charAt(0).toUpperCase() + inputTxt.trim().slice(1) : inputTxt;

        // its not a number and its an empty string
        if(!isNumber && inputTxt.length < 1){
            $scope.orderedAgents = angular.copy($scope.orderedAgentsBackup);
            agentsList.classList.remove('empty-list');

        // its not a number but its not an empty string      
        }else if(!isNumber && inputTxt.length >= 1){
            var firstChar = inputTxt.charAt(0);

            var agentsBlock = $scope.orderedAgentsBackup.filter(function(obj){
              return obj.letter == firstChar;
            });

            if(agentsBlock.length > 0){

                $scope.orderedAgents = angular.copy(agentsBlock);

                $scope.orderedAgents[0]['agents'] = agentsBlock[0].agents.filter(function(el){
                    return el.userName.trim().indexOf(inputTxt) !== -1;
                });

                ($scope.orderedAgents[0].agents.length < 1) ? agentsList.classList.add('empty-list') : agentsList.classList.remove('empty-list');

            }else{
              $scope.orderedAgents = [];
              $scope.orderedAgents[0] = {
                letter: firstChar,
                agents: []
              };

              agentsList.classList.add('empty-list');
            }

        // its a number
        }else if(isNumber){

            var agentsMatched = [];

            $scope.orderedAgentsBackup.forEach(function(letterBlock, idx){
                letterBlock.agents.forEach(function(letterAgent, ind){
                    var idNum = (typeof letterAgent.userId == 'number') ? letterAgent.userId.toString() : letterAgent.userId.trim();
                    if(idNum.indexOf(inputTxt) !== -1 && agentsMatched.indexOf(letterBlock) == -1){
                      if(inputTxt.length == 1){
                          (idNum.indexOf(inputTxt) == 0) ? agentsMatched.push(letterBlock) : null;
                      }else{
                          agentsMatched.push(letterBlock);
                      }
                    }
                });
            });


            if(agentsMatched.length > 0){

                $scope.orderedAgents = angular.copy(agentsMatched);

                $scope.orderedAgents.forEach(function(objItm, i){
                    $scope.orderedAgents[i]['agents'] = objItm['agents'].filter(function(el){
                        var idNum = (typeof el.userId == 'number') ? el.userId.toString() : el.userId.trim();
                        return idNum.indexOf(inputTxt) !== -1;
                    });
                });

                ($scope.orderedAgents.length < 1) ? agentsList.classList.add('empty-list') : agentsList.classList.remove('empty-list');

            }else{
              $scope.orderedAgents = [];
              $scope.orderedAgents[0] = {
                letter: 'None',
                agents: []
              };

              agentsList.classList.add('empty-list');
            }

        }
      }

      $scope.getTwoBestAgents = function(){
          var successIntegrationsCollection = [];

          $scope.agentsWithoutOrder.forEach(function(ag){
              successIntegrationsCollection.push(ag.integrations.success);
          });

          var greatestNumbers = [];

          greatestNumbers[0] = Math.max.apply(null, successIntegrationsCollection);
          successIntegrationsCollection.splice(successIntegrationsCollection.indexOf(greatestNumbers[0]), 1);
          greatestNumbers[1] = Math.max.apply(null, successIntegrationsCollection);

          // console.log(greatestNumbers);


          var bestAgents = $scope.agentsWithoutOrder.filter(function(theAgent){
              return theAgent.integrations.success >= greatestNumbers[1] || theAgent.integrations.success >= greatestNumbers[0];
          });

          return (bestAgents.length > 2) ? bestAgents.slice(2) : bestAgents;
      }


      $scope.getPocTotalIntegrationsInfo = function(){
        var totalIntegrations = {
            succededIntegrations : 0,
            notStartedIntegrations: 0,
            pendingIntegrations: 0,
            totalThisMonth: 0,
            actualMonthName: '',
            previousMontsInfo: []
        };

        var myActualMonth = new Date().getMonth(),
            myActualYear  = new Date().getFullYear();

        // ACTUAL MONTH INFO

        $scope.agentsWithoutOrder.forEach(function(ag){
            var agentSuccess = ag.allAccounts.filter(function(acc){ return acc.status == 'success'}),
                agentPending = ag.allAccounts.filter(function(acc){ return acc.status == 'pending'}),
                agentNotStarted = ag.allAccounts.filter(function(acc){ return acc.status == 'notStarting'});

            var theDate = new Date();

            totalIntegrations.succededIntegrations += accountComplementaryService.accountsThisMonth(agentSuccess)['length'];
            totalIntegrations.notStartedIntegrations += accountComplementaryService.accountsThisMonth(agentNotStarted)['length'];
            totalIntegrations.pendingIntegrations += accountComplementaryService.accountsThisMonth(agentPending)['length'];
        });

        totalIntegrations.totalThisMonth = totalIntegrations.succededIntegrations + totalIntegrations.notStartedIntegrations + totalIntegrations.pendingIntegrations;
        totalIntegrations.percentBase = totalIntegrations.totalThisMonth / 100;

        // ACTUAL MONTH INFO END

        // PREVIOUS MONTHS

        $scope.monthsCollection = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        totalIntegrations.actualMonthName = $scope.monthsCollection[myActualMonth];

        var referenceIdxStart = (myActualMonth == 0) ? 11 : myActualMonth - 1;
        myActualYear = (myActualMonth == 0) ? myActualYear - 1 : myActualYear;

        for (var i = 1; i < 5; i++) {

            var prevMonth = $scope.monthsCollection[referenceIdxStart];

            // console.log(referenceIdxStart, prevMonth);

            var totalMonthIntegration = 0;
            var referenceTime = new Date(myActualYear, referenceIdxStart);

            $scope.agentsWithoutOrder.forEach(function(ag){
                var agentSuccess = ag.allAccounts.filter(function(acc){ return acc.status == 'success'});
                totalMonthIntegration += accountComplementaryService.accountsThisMonth(agentSuccess, referenceTime)['length'];
            });

            var infoObject = {
                idxReference: 'month-' + i,
                monthReference: prevMonth,
                monthIntegrations: totalMonthIntegration
            };


            totalIntegrations.previousMontsInfo.push(infoObject);

            myActualYear = (referenceIdxStart == 0) ? myActualYear - 1 : myActualYear;
            referenceIdxStart = (referenceIdxStart == 0) ? 11 : referenceIdxStart - 1;
        }

        return totalIntegrations;
      }

      $scope.showAdvanced = function(ev) {

        var bestAgents = $scope.getTwoBestAgents();
        var integrationsToShow = $scope.getPocTotalIntegrationsInfo();

        // console.log('justStarting', bestAgents, integrationsToShow);

        $mdDialog.show({
          controller: DialogController,
          templateUrl: folderStructureUrl + 'payrollstatistics/payrollstatistics.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            agentsToShow: bestAgents,
            monthIntegrationsInfo: integrationsToShow,
            pocInfo: $scope.actualPoc
          },
          clickOutsideToClose:true
        });
      };

      function DialogController($scope, $mdDialog, agentsToShow, monthIntegrationsInfo, pocInfo) {
        $scope.integrationsInfo = monthIntegrationsInfo;
        $scope.bestAgentsOnMonth = agentsToShow;
        $scope.actualPOC = pocInfo;

        $scope.bestAgentName = $scope.bestAgentsOnMonth[0]['userName'];

        $scope.labelsBar = [
            $scope.integrationsInfo.previousMontsInfo[3]['monthReference'],
            $scope.integrationsInfo.previousMontsInfo[2]['monthReference'],
            $scope.integrationsInfo.previousMontsInfo[1]['monthReference'],
            $scope.integrationsInfo.previousMontsInfo[0]['monthReference'],
            $scope.integrationsInfo.actualMonthName
        ];

        $scope.dataBar = [
          [ 
            $scope.integrationsInfo.previousMontsInfo[3]['monthIntegrations'],
            $scope.integrationsInfo.previousMontsInfo[2]['monthIntegrations'],
            $scope.integrationsInfo.previousMontsInfo[1]['monthIntegrations'],
            $scope.integrationsInfo.previousMontsInfo[0]['monthIntegrations'],
            $scope.integrationsInfo.succededIntegrations
          ]
        ];

        $scope.barColors = [
            '#47aafd'
        ];

        $scope.doughnutLabels        = ["Completados", "Sin iniciar", "Pendientes"];
        $scope.doughnutColors        = ["#56d27e", "#47aafd", "#dd1f26"];
        $scope.doughnutData  = [
              $scope.integrationsInfo.succededIntegrations, 
              $scope.integrationsInfo.notStartedIntegrations, 
              $scope.integrationsInfo.pendingIntegrations
            ];

        $scope.successIntegrationsPct    = ($scope.integrationsInfo.percentBase == 0) ? 0 : Math.floor($scope.integrationsInfo.succededIntegrations   / $scope.integrationsInfo.percentBase);
        $scope.notStartedIntegrationsPct = ($scope.integrationsInfo.percentBase == 0) ? 0 : Math.floor($scope.integrationsInfo.notStartedIntegrations / $scope.integrationsInfo.percentBase);


        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
      };

 }])
.directive('locationSidenav', function(){
  return {
    restrict: 'E',
    controller: 'LocationSideNavLeftCtrl',
    templateUrl: folderStructureUrl + 'location-pocs/sidenav-left/location-sidenav-left.html'
  }
});

