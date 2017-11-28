var topNums = [];
var bottomNums = [];
var domScores = document.getElementsByClassName("bold-underline");
var domNamesSelector = $('.box-round:eq(1) > table > tbody > tr:not(:first)');
var spectrumUrl = chrome.extension.getURL('resources/Spectrum.png');
if(domNamesSelector.length == 0){
	domNamesSelector = $('table:eq(1) > tbody > tr:not(:first)');
}
var domNames = [];
var scores = [];
var names = [];
var scoresAtTimes = [];
var exempt;
var tops;
var bots;
if(document.title == "String key was not found!"){
	document.title = "Powerschool";
}
for(var i = 0;i<domNamesSelector.length;i++){
	domNames.push($(domNamesSelector[i]).find('td:eq(2)').text());
}
for(var place = 0;place<domScores.length;place++){
	exempt = false;
	$(domScores[place]).parent().siblings().each(function(){
		if($(this).find('img').length > 0){
			src = $(this).find('img').attr('src');
			if(src !== '/images/icon_late.gif' && src !== '/images/icon_check.gif'){//may need to add other possible icons
				exempt = true;
			}
		}
	});
	var slashed = domScores[place].innerHTML;
	try{
		if($(slashed).is('a')){
			var a = $(domScores[place]).contents().filter(function() {
    		return this.nodeType == Node.TEXT_NODE;
  		}).text();
  			scores.push($(slashed).html()+a);
		}

	}catch(e){
	}
	if(!isNaN(parseInt(slashed[0]))){
		if(!exempt){
			scores.push(slashed);
		}else{
			scores.push('0/0');
		}
		var maxLength = 20;
		if(domNames[place].length > maxLength){
			names.push(domNames[place].substring(0,maxLength)+'...');
		}else{
			names.push(domNames[place]);
		}
	}
}
function getScore(arr){
	for(var l = 0;l<arr.length;l++){
		var num = arr[l];
		var topNum = [];
		var bottomNum = [];
		var x;
		var y;
		for(var i = 0;i<num.length;i++){
			if(num.indexOf('/') == -1){
				x = num;
				y = 0;
			}else{
				if(num[i] == '/'){
					for(var j = 0;j<i;j++){
						topNum.push(num[j]);
						x = topNum.join('');
					}
					for(var k = i+1;k<num.length;k++){
						bottomNum.push(num[k]);
						y= bottomNum.join('');
					}

				}else if(num[i] == '.'){
					for(var m = i;m>2;m--){
						topNum.push(num[m]);
						x = topNum.join('');
					}

				}
			}
		}
		topNums.push(parseFloat(x));
		bottomNums.push(parseFloat(y));
    }
    tops = sumList(topNums);
    bots = sumList(bottomNums);
    return tops/bots;

}
function sumList(arr){
	var sum = 0;
	for(var i = 0;i<arr.length;i++){
		sum += arr[i];
	}
	return sum;
}
if(window.location.href.indexOf('scores')> -1){
	$('.box-round:eq(1)').after('<canvas id="apointochart" width="800" height="400" style="border:1px solid black"></canvas>');
	if($('canvas').length == 0){
		$('table:eq(1)').after('<canvas id="apointochart" width="800" height="400" style="border:1px solid black"></canvas>');
	}
	var canvas = document.getElementById('apointochart');
	canvas.style.width = '100%';
	canvas.width = canvas.offsetWidth;

	var options = {
		bezierCurve:false,
		scaleLabel: "<%=value+'%'%>"
	};
}

var av = (getScore(scores))*100;
for(var i = 0;i < scores.length;i++){
	var currentTops = [];
	var currentBots = [];
	for(var j = i; j >= 0; j--){
		currentTops.push(topNums[j]);
		currentBots.push(bottomNums[j]);
	}
	scoresAtTimes.push(((sumList(currentTops)/sumList(currentBots))*100).toFixed(3));
}
var data = {
    labels: names,
    datasets: [
        {
            label: "Scores",
            fillColor: "rgba(0,0,220,0.25)",
            strokeColor: "rgba(0,0,220,0.5)",
            pointColor: "rgba(0,0,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: scoresAtTimes
        }
    ]
};

$('.box-round:eq(0) table tbody tr:eq(1) td:eq(3)').attr('id', 'score_id');
var letterGrade;
if(window.location.href.indexOf('scores') > -1){
	letterGrade = $('.box-round:eq(0) table tbody tr:eq(1) td:eq(3)').html().split('<script')[0];
}
if(location.href.indexOf('studentsched') == -1 && location.href.indexOf('termgrades') == -1){
	$('#score_id').html(letterGrade+av.toFixed(4)+"% ("+Math.round(av)+")% ("+tops+'/'+bots+')<br/><span id="weighted_percent"></span>');
}


var ctx;
var chart;
var gradesTable = document.getElementsByTagName('table')[2];
if(window.location.href.indexOf('scores')> -1){
	gradesTable.getElementsByTagName('tr')[0].insertAdjacentHTML('beforeend', '<th class="center">Weight<p id="weigh_me">Save</p></th>');
	document.getElementById('weigh_me').addEventListener('click', function(){
		var finalScore = weighGrades(false);
		if(typeof finalScore == 'string'){
			alert(finalScore);
		}else if(!isNaN(finalScore)){
			var weightedGrade = weighGrades(true).toFixed(4);
			if(av.toFixed(4) != weightedGrade){
				$('#weighted_percent').html('('+weightedGrade+'% when weighted)');
			}else{
				$('#weighted_percent').html('');
			}
		}else{
			alert('Please abide by common logic.');
		}
	});
	setTimeout(function(){
		ctx = document.getElementById('apointochart');
		ctx = ctx.getContext('2d');
		chart = new Chart(ctx).Line(data,options);
	},1);
}

var gtr;
if(window.location.href.indexOf('scores')> -1){

	gtr = gradesTable.getElementsByTagName('tr');
}

function add(a,b){
	return a+b;
}

function getCountOfVal(arr, val){
	var count = 0;
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == val){
			count++;
		}
	}
	return count;
}

//chrome.storage.sync.clear();
var initialWeigh = false;
function saveWeight(we, noError){
	var classUrl = window.location.href;
	var weightsList = [];
	for(var i = 0; i < we.length; i++){
		if(we[i].value){
			var assigName = $(we[i]).parent().parent().find('td:eq(2)').html();
			weightsList.push({assigname:assigName, weight:we[i].value});
		}
	}
	chrome.storage.sync.get("weights", function(cfg) {
		cfg = cfg['weights'];
		if(!cfg){
			cfg = {};
		}
		if(!cfg[classUrl]){
			cfg[classUrl] = [];
		}

		if(!initialWeigh){
			for(var i = 0; i < cfg[classUrl].length; i++){
				if(cfg[classUrl][i].weight > 0){
					$('td:contains("'+cfg[classUrl][i].assigname+'")').parent().find('.weight').val(cfg[classUrl][i].weight);
				}
			}
			initialWeigh = true;
			var weightedGrade = weighGrades(true).toFixed(4);
			if(av.toFixed(4) != weightedGrade){
				$('#weighted_percent').html('('+weightedGrade+'% when weighted)');
			}
		}else if(noError){
			cfg[classUrl] = weightsList;

			chrome.storage.sync.set({'weights':cfg});
		}
	});
}

var weights = [];
function weighGrades(fromWithin){
	var weightElems = document.getElementsByClassName('weight');
	weights = [];
	var allWeights = [];
	var noError = true;

	for(var i = 0; i < weightElems.length; i++){
		if(weightElems[i].value == ''){
			weights.push({topScore:topNums[i], botScore:bottomNums[i], weight:0});
			continue;
		}
		if(isNaN(parseFloat(weightElems[i].value))||isNaN(parseInt(weightElems[i].value))||weightElems[i].value > 100 || weightElems[i].value < 0 || weightElems[i].value.length < 1){
			return 'Please use only numeric values between 0 and 100.';
		}
		if(weightElems.length < 2){
			return 'There must be multiple grades in order for weights to function.';
		}
		allWeights.push(parseFloat(weightElems[i].value));
		weights.push({topScore:topNums[i], botScore:bottomNums[i], weight:parseFloat(weightElems[i].value)});
	}
	if(sumList(allWeights) > 100 || sumList(allWeights) < 0){
		return "The weights must add up to a value between 0 and 100.";
	}
	if(!fromWithin){
		saveWeight(weightElems, noError);
	}
	var unweightedTopScore = 0;
	var unweightedBotScore = 0;
	var finalScore = 0;

	for(var i = 0;i<weights.length;i++){
		if(weights[i].topScore && weights[i].botScore && weights[i].botScore > 0){
			if(weights[i].weight == 0){
				unweightedTopScore += weights[i].topScore;
				unweightedBotScore += weights[i].botScore;
			}else{
				finalScore += (weights[i].topScore/weights[i].botScore)*weights[i].weight;
			}
		}
	}
	finalScore += (100-sumList(allWeights))*(unweightedTopScore/unweightedBotScore);

	return finalScore;
};
//prioritize classes that are in session
if(window.location.href.indexOf('scores') < 0){
	var inactiveRows = $('#quickLookup .grid tbody tr[id^="ccid"]').filter(function() { return ($(this).children().is('.notInSession')); });
	for(var i = 0; i < inactiveRows.length; i++){
		$('#quickLookup .grid tbody tr[id^="ccid"]').last().after(inactiveRows[i]);
	}
}

//weight inputs
if(window.location.href.indexOf('scores')> -1){
	for(var i = 1; i < gtr.length-1; i++){
		gtr[i].insertAdjacentHTML('beforeend', '<td align="center"><input class="weight" type="text" size="3"></input><p class="weigh_me" id="weight'+i+'"></p>%</td>');
		var thisWeight = $('#weight'+i).val().length > 0 ? $('#weight'+i).val() : 0;
		weights.push({topScore:topNums[i-1], botScore:bottomNums[i-1], weight:thisWeight});
	}
}
//rainbow
chrome.storage.sync.get('age',function(d){
	if(window.location.href.indexOf('home.html') > -1 && (d['age'] || d['age'] === undefined)){
	var grades = $('#quickLookup .grid tbody tr td:has(a)').not(':has(em)');
	var today = Date.now();
	$('#quickLookup th').first().append('<div id="spectrum"><img src="'+spectrumUrl+'"/><p class="newer_older" id="newer">&mdash; Time Since Last Change &rarr;</p></div>');

	$(grades).each(function(){
		var gradeElem = $(this);
		if($(this).find('a').html() != '--'){
			$.get($(this).find('a').attr('href'),function(d){
				var htmlData = $.parseHTML(d);
				var lastUpdate = $(htmlData).find('.box-round').first().find('table:eq(1) tbody tr td').html();
				var year = parseInt(lastUpdate.match(/\d{4}$/)[0]);
				var month = parseInt(lastUpdate.match(/\d{2}/)[0]);
				var day = parseInt(lastUpdate.split('/')[1]);
				var millis = new Date(year, month-1, day, 0, 0, 0, 0).getTime();
				var distance = (today-millis)/100000000;
				var color;
				if(distance > rainbow.length){
					color = 'black';
				}else{
					color = rainbow[Math.floor(distance)];
				}
				$(gradeElem).css({
					'border-color':color,
					'border-width':'2px'
				});
			});
		}
	});
	}
});
var rainbow = ['red','#C04000','#F87431','#E9AB17','#FBB917','#FFDB58','#B1FB17','green','#008080','#0000A0','#571B7E','black'];

chrome.runtime.sendMessage({arr: [topNums,bottomNums, weights]}, function(response) {
  return(false);
});

//Calculate GPA
var today = new Date();
var unweightedGpaScale;
var weightedGpaScale;
var yearName = today.getFullYear();
var imageUrl = chrome.extension.getURL('apointo.png');
$('#nav-main ul').append('<li id="btn-gpa"><img class="gpa_image" src="'+imageUrl+'"/><a>My GPA</a></li>');
$('#btn-gpa').click(function(){
	unweightedGpaScale = {'A+':4.0, 'A': 3.811, 'A-':3.667, 'B+':3.333, 'B':3.0, 'B-':2.667, 'C+':2.333, 'C':2.0, 'C-':1.667, 'D+':1.333, 'D':1.0, 'D-':.667, 'F':0};
	weightedGpaScale = {'A+':4.333, 'A':4.144, 'A-':4.0, 'B+':3.667, 'B':3.333, 'B-':3.0, 'C+':2.667, 'C':2.333, 'C-':2.0, 'D+':1.667, 'D':1.0, 'D-':1.0, 'F':0};
	$('#content-main').empty();
	$('#content-main').append('<h3>Step 1: Select GPA Scale</h3><table class="gpa-table custom_table"> <caption>Default (Batesville) GPA Scale</caption> <tr> <th>Grade</th> <th>Unweighted</th> <th>Weighted</th> </tr> <tr> <td>A+</td> <td>4.0</td> <td>4.333</td> </tr> <tr> <td>A</td> <td>3.811</td> <td>4.144</td> </tr> <tr> <td>A-</td> <td>3.667</td> <td>4.0</td> </tr> <tr> <td>B+</td> <td>3.333</td> <td>3.667</td> </tr> <tr> <td>B</td> <td>3.0</td> <td>3.333</td> </tr> <tr> <td>B-</td> <td>2.667</td> <td>3.0</td> </tr> <tr> <td>C+</td> <td>2.333</td> <td>2.667</td> </tr> <tr> <td>C</td> <td>2.0</td> <td>2.333</td> </tr> <tr> <td>C-</td> <td>1.667</td> <td>2.0</td> </tr> <tr> <td>D+</td> <td>1.333</td> <td>1.667</td> </tr> <tr> <td>D</td> <td>1.0</td> <td>1.333</td> </tr> <tr> <td>D-</td> <td>.667</td> <td>1.0</td> </tr> <tr> <td>F</td> <td>.00</td> <td>.00</td> </tr></table>');
	$('#content-main').append('<h3>Step 2: Select Year of First High School Class</h3><select id="year_select"><option value="25">2015-16</option><option value="24">2014-15</option><option value="23" selected>2013-14</option><option value="22">2012-13</option><option value="21">2011-12</option><option value="20">2010-11</option><option value="19">2009-10</option></select><button id="go_button">Go</button>');
	chrome.storage.sync.get(['classesUsed', 'firstYear'], function(d){
		if(!$.isEmptyObject(d)){
				$('#year_select').val(d['firstYear']);
				var classesUsed = d['classesUsed'];
				clickFunction(false);
				$('.grade_row').each(function(){
					var thisClass = $(this);

					for(var i = 0; i < classesUsed.length; i++){
						if($(thisClass).data('name') == classesUsed[i]['name']){
							if(classesUsed[i]['weighted']){
								$(thisClass).find('.check_box_weighted').attr('checked', 'checked');
							}
							return true;
						}
					}
					$(thisClass).find('.check_box_included').prop('checked', false);


				});

			calculateClick();
		}
	});
	$('#go_button').click(function(){
		clickFunction(true);
	});
});
function calculateClick(){
	var classesUsed = [];
	var gpaSum = 0.0;
	var liveGpaSum = 0.0;
	var classCount = 0.0;
	var liveClassCount = 0.0;
	var unweightedGpaSum = 0.0;
	var liveUnweightedGpaSum = 0.0;
	$('.grade_row').each(function(){
		var gpaListToUse;
		if($(this).find('.check_box_included').is(':checked')){
			if($(this).find('.check_box_weighted').is(':checked')){
				gpaListToUse = weightedGpaScale;
			}else{
				gpaListToUse = unweightedGpaScale;
			}
			classesUsed.push({'name':$(this).data('name'), 'weighted':$(this).find('.check_box_weighted').is(':checked')});
			var firstGrade = $(this).data('firstGrade');
			var secondGrade = $(this).data('secondGrade');
			var d = new Date();
			if(firstGrade.match(/^[A-Z]/)){
				if(!$(this).hasClass('current_year') || d.getMonth() <= 6){
					gpaSum += gpaListToUse[firstGrade];
					console.log($(this).data('name'))
					unweightedGpaSum += unweightedGpaScale[firstGrade];
					classCount++;
				}
				liveGpaSum += gpaListToUse[firstGrade];
				liveUnweightedGpaSum += unweightedGpaScale[firstGrade];
				liveClassCount++;

			}
			if(secondGrade.match(/^[A-Z]/)){
				liveGpaSum += gpaListToUse[secondGrade];
				liveUnweightedGpaSum += unweightedGpaScale[secondGrade];
				liveClassCount++;
				if(!$(this).hasClass('current_year')){
					gpaSum += gpaListToUse[secondGrade];
					unweightedGpaSum += unweightedGpaScale[secondGrade];
					classCount++;
				}
			}
		}
	});
	chrome.storage.sync.remove(['classesUsed', 'firstYear']);
	chrome.storage.sync.set({'classesUsed':classesUsed});
	chrome.storage.sync.set({'firstYear': parseInt($('#year_select').val())});
	$('#gpa_div').remove();
	$('#content-main').prepend('<div id="gpa_div"><h1 class="gpa_title">Live Weighted GPA: </h1><p class="gpa">'+(liveGpaSum/liveClassCount).toFixed(6)+'</p><h1 class="gpa_title">Live Unweighted GPA: </h1><p class="gpa">'+(liveUnweightedGpaSum/liveClassCount).toFixed(6)+'</p><br/>'+'<h1 class="gpa_title">Official Weighted GPA: </h1><p class="gpa">'+(gpaSum/classCount).toFixed(6)+'</p><h1 class="gpa_title">Official Unweighted GPA: </h1><p class="gpa">'+(unweightedGpaSum/classCount).toFixed(6)+'</p></div>');

}
function clickFunction(firstRun){
	$('#content-main').append('<h3>Step 3: Select Classes that Apply to your GPA</h3>');
	var firstYear = parseInt($('#year_select').val());
	var currentYear = today.getFullYear() - 1991;
	var maxTableLength = 0;
	var baseUrl = window.location.href.split('guardian/')[0]+'guardian/termgrades.html?histyearid=';
	for(var i = firstYear; i < currentYear; i++){
		$.ajax({
			url:baseUrl+i,
			async:false,
			success: function(data){
					yearName = $(data).find('.selected a').html();
					if(yearName == null){
						return;
					}
					$('#content-main').append('<table class="custom_table grades_table" id="grades_table_year_'+i+'"><th>'+yearName+'<span class="weighted_title">Weighted</span><span class="include_title">Include</span></th></table>');
					var firstSemNum = 1;
					var secondSemNum = 5;
					if($(data).find('#gradesHistory table tbody tr').first().find('td').size() > 3){
						firstSemNum = 9;
						secondSemNum = 21;
					}
					$(data).find('#gradesHistory table tbody tr').slice(2).each(function(index){
						var thisName = $(this).find('td').first().html();
						$('#grades_table_year_'+i).append('<tr class="grade_row" data-name="'+thisName+'" data-first-grade="'+$(this).find('td:eq('+firstSemNum+')').html()+'" data-second-grade="'+$(this).find('td:eq('+secondSemNum+')').html()+'"><td class="class_name">'+thisName+'</td><td><input type="checkbox" value="'+thisName+'" class="check_box check_box_included" checked></td><td><input type="checkbox" value="'+thisName+'_weighted" class="check_box check_box_weighted"></td></tr>');
					});
				}

		});
	}
	currentYear++;
	$.ajax({
		url:window.location.href.split('guardian/')[0]+'guardian/home.html',
		async:false,
		success: function(data){
			yearName = today.getFullYear() - 1 +'-'+today.getFullYear();
			$('#content-main').append('<table class="custom_table grades_table" id="grades_table_year_'+currentYear+'"><th>'+yearName+'<span class="weighted_title">Weighted</span><span class="include_title">Include</span></th></table>');
			$(data).find('#quickLookup table tbody tr').slice(3).each(function(index){
				var thisName = $(this).find('td:eq(11)').contents().filter(function(){
													return this.nodeType == 3;
											})[0].nodeValue;
				var second_grade = $(this).find('td:eq(13)').find('a').text().replace(/[0-9]/g, "");
				var first_grade = $(this).find('td:eq(12)').find('a').text().replace(/[0-9]/g, "");
				if(first_grade == "--" && second_grade == "--"){
					return true;
				}
				$('#grades_table_year_'+currentYear).append('<tr class="grade_row current_year" data-name="'+thisName+'" data-first-grade="'+first_grade+'" data-second-grade="'+second_grade+
				'"><td class="class_name">'+thisName+'</td><td><input type="checkbox" value="'+thisName+'" class="check_box check_box_included" checked></td><td><input type="checkbox" value="'+thisName+'_weighted" class="check_box check_box_weighted"></td></tr>');
			});
		}
	});


	//calculate GPAs
		$('#content-main').append('<button id="calculate_button">Calculate</button>');
		$('#calculate_button').click(function(){
			calculateClick();
		});
		$('#content-main').append('<p class="weighted_link">Batesville student? Click <a href="http://batesvilleinschools.com/bhs/guidance/scheduling/">here</a> to find the list of weighted classes.</p>');
}

weighGrades(false);
