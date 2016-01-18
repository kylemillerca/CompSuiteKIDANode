var express = require('express');
var router = express.Router();
var http = require('http');

var divisions = {
  PESJ: 1,
  PEIBr: 2,
  PESBr: 3,
  PEIG: 4,
  PESG: 5,
  PEIBl: 6,
  PESBl: 7,
  PEIS: 8,
  PEIP: 9,
  PESP: 10,
  PEIW: 11,
  PESW: 12,
  PSJ: 13,
  PIBr: 14,
  PSBr: 15,
  PIG: 16,
  PSG: 17,
  PIBl: 18,
  PSBl: 19,
  PIS: 20,
  PIP: 21,
  PSP: 22,
  PIW: 23,
  PSW: 24,
  MIJ: 25,
  MSJ: 26,
  MIG: 27,
  MSG: 28,
  MIWh: 29,
  MSWh: 30,
  MIB: 31,
  MSB: 32,
  GSC: 33,
  GIJ: 34,
  GSJ: 35,
  GIBr: 36,
  GSBr: 37,
  GIG: 38,
  GSG: 39,
  GIWh: 40,
  GSWh: 41,
  GIB: 42,
  GSBl: 43,
  GIS: 44,
  GIP: 45,
  GSP: 46,
  GIW: 47,
  GSW: 48
}

/* GET competitions listing. */
router.get('/', function(req, res, next) {
  http.get('http://api.competitionsuite.com/2013-02/Competitions/?o=083f0311-82dd-466a-b556-81b0d540deb2', function(response){
    response.setEncoding('utf8');

    var year = '2016';

    var data = '';
    response.on('data', function (chunk) {
       data = data + chunk;
    });
    response.on('end', function() {
      var compArray = JSON.parse(data).filter(function(elem) {
        return new Date(elem.Date) > new Date(year + '-01-01T00:00:00');
      }).sort(function (a,b){
          return new Date(a.Date) - new Date(b.Date);
      });
      res.render('competitions', { year: year, compArray: compArray});
    });
  });

});


router.get('/registeredUnits', function(req, res, next){
  http.get('http://api.competitionsuite.com/2013-02/Competitions/?o=083f0311-82dd-466a-b556-81b0d540deb2', function(response){
    response.setEncoding('utf8');

    var year = '2016';

    var units = {};

    var data = '';
    response.on('data', function (chunk) {
      data = data + chunk;
    });

    response.on('end', function() {
      var compArray = JSON.parse(data).filter(function(elem) {
        return new Date(elem.Date) > new Date(year + '-01-01T00:00:00');
      });

      var counter = 0;
      for(var i = 0; i < compArray.length; i++){
        var show = compArray[i].EventName;
        var compId = compArray[i].EventGuid;
        http.get('http://api.competitionsuite.com/2013-02//registration/?e='+compId, function(response){
          var data = '';
          var year = '2016';
          response.on('data', function (chunk) {
            data = data + chunk;
          });

          response.on('end', function() {
            var unitArray = JSON.parse(data);
            counter++;
            for(var j = 0; j < unitArray.length; j++){
              if(units[unitArray[j].GroupName]){
                units[unitArray[j].GroupName].competitions.push(show);
              }
              else{
                units[unitArray[j].GroupName] = {competitions: [show]};
                units[unitArray[j].GroupName].division = unitArray[j].DivisionName;
              }
            }
              if(counter === compArray.length)
                res.render('units', { year: year, units: units});
          });
        });
      }

    });
  });
});

router.get('/lineup/:compId', function(req, res, next){
  var compId = req.params.compId;

  http.get('http://api.competitionsuite.com/2013-02//registration/?e='+compId, function(response){
    var data = '';
    var year = '2016';
    response.on('data', function (chunk) {
      data = data + chunk;
    });

    response.on('end', function() {
      var dataArray = JSON.parse(data);

      var dataMap = {};
      var waitlistMap = {};
      dataArray.forEach(function(unit){
        var map;
        if(unit.Waitlisted === true)
        {
          map = waitlistMap;
        }
        else{
          map = dataMap;
        }

        if(map[unit.DivisionInitials]){
          map[unit.DivisionInitials].push(unit);
        }
        else{
          map[unit.DivisionInitials] = [unit];
        }
      });

      var groupArray = [];
      var waitlistArray = [];
      for(var division in dataMap){
        groupArray.push({division: division, units: dataMap[division].sort(function(a,b){
          return a.GroupName.localeCompare(b.GroupName);
        })});
      }
      for(var division in waitlistMap){
        waitlistArray.push({division: division, units: waitlistMap[division].sort(function(a,b){
          return a.GroupName.localeCompare(b.GroupName);
        })});
      }

      groupArray = groupArray.sort(function(a,b){
        if(divisions[a.division] === undefined || divisions[b.division] === undefined){
          console.log("Bad Division lookup...." + a.division + " " + b.division);
        }
        return divisions[a.division] - divisions[b.division];
      });

      waitlistArray = waitlistArray.sort(function(a,b){
        if(divisions[a.division] === undefined || divisions[b.division] === undefined){
          console.log("Bad Division lookup...." + a.division + " " + b.division);
        }
        return divisions[a.division] - divisions[b.division];
      });


      res.render('publicLineups', { year: year, groupArray: groupArray, waitlistArray: waitlistArray});
    });
  });
});

router.get('/:compId', function(req, res, next){
  var compId = req.params.compId;

  http.get('http://api.competitionsuite.com/2013-02//registration/?e='+compId, function(response){
    var data = '';
    var year = '2016';
    response.on('data', function (chunk) {
      data = data + chunk;
    });

    response.on('end', function() {
      var groupArray = JSON.parse(data).sort(function(a,b){
        return a.DivisionInitials.localeCompare(b.DivisionInitials);
      });
      res.render('lineups', { year: year, groupArray: groupArray});
    });
  });
});



module.exports = router;
