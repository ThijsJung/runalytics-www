google.charts.load('current', {packages: ['corechart', 'line']});

// Callback function
function callAPI(url, cFunction) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			cFunction(xhttp.responseText);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function loadGraphs(run_id = "2015-12-06T14:37:21"){
    console.log("Run ID: " + run_id);
    var url = 'https://fmp7y4ey29.execute-api.eu-west-1.amazonaws.com/Prod/run/' + run_id;

    callAPI(url, function(response){
		var responseJSON = JSON.parse(response);
        var timestampData = responseJSON["Item"]["timestamps"];
        loadRouteMap(responseJSON["Item"]["coordinates"]);
        loadHeartRateChart(responseJSON["Item"]["heart_rates"], timestampData);
        loadPaceChart();
    });
}

function loadRouteMap(routeData){
    var runCoordinates = [];
    for (var i = 0; i < routeData.length; i++) {
        runCoordinates.push({
            lat: routeData[i][0] * (180 / Math.pow(2, 31)),
            lng: routeData[i][1] * (180 / Math.pow(2, 31))
        })
    }
    
    var start_point = runCoordinates[0];
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: start_point
    });

    var runPath = new google.maps.Polyline({
        path: runCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    runPath.setMap(map);
}

function loadRunMenu(){
    var url = 'https://fmp7y4ey29.execute-api.eu-west-1.amazonaws.com/Prod/run';
	callAPI(url , function(response){
		var myRuns = JSON.parse(response);
        var selectRun = document.getElementById("user_run");
        
        for (var i = 0; i < myRuns.length; i++) {
            var runId = i;
            var runName = myRuns[i];
            if (runName === null){
                runName = "Unnamed run " + runId;
            }
            console.log("Run name: " + runName);
            var el = document.createElement("option");
            el.textContent = runName;
            el.value = runName;
            selectRun.appendChild(el);
        }
	})
}

function loadPaceChart(){
    var data = new google.visualization.DataTable(paceData);
    data.addColumn('string', 'X');
    data.addColumn('number', 'Pace');

    var paceData = [
        ['1', 6.20],
        ['2', 6.03],
        ['3', 5.55],
        ['4', 5.40],
        ['5', 6.13],
    ];
    data.addRows(paceData);

    var options = {
        'title' : 'Pace (min/km)',
        hAxis: {
            title: 'Distance (km)',
            type: 'string'
        },
        vAxis: {
            title: 'Pace (min/km)'
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('pace_chart'));

    chart.draw(data, options);
}

function loadHeartRateChart(heartRateData, timestampData){
    var data = new google.visualization.DataTable(heartRateData);
    data.addColumn('string', 'X');
    data.addColumn('number', 'Heart rate');
    var timeHeartrateData = [];
    for (var i = 0; i < timestampData.length; i++) {
        timeHeartrateData.push(
            [timestampData[i], heartRateData[i]]
        );
    }

    data.addRows(timeHeartrateData);
    var options = {
        'title' : 'Heart rate (bpm)',
        hAxis: {
            title: 'Time (seconds)'
        },
        vAxis: {
            title: 'Heart rate (bpm)'
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('heart_rate_chart'));
    chart.draw(data, options);
}

loadRunMenu();
loadGraphs();

google.charts.setOnLoadCallback(loadPaceChart);
google.charts.setOnLoadCallback(loadHeartRateChart);
