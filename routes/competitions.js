var express = require('express');
var router = express.Router();
var http = require('http');

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
