var back = chrome.extension.getBackgroundPage();
var but = document.getElementById("but");
var but2 = document.getElementById("but2");
var necessaryScore = document.getElementById("necessary_score");
var p = document.getElementById("p");
var tops = back.sco[0];
var bots = back.sco[1];
var weights = back.sco[2];
var allWeights = [];
var num1 = 0;
var num2 = 0;
/*
TODO:get laid
*/
for(var i = 0; i < weights.length; i++){
	allWeights.push(weights[i].weight);
}
function weighGrades(){
	var weightElem = document.getElementById('weight');

	if(isNaN(parseFloat(weightElem.value))||isNaN(parseInt(weightElem.value))||weightElem.value > 100 || weightElem.value < 1){
		alert('Please use only numeric values between 1 and 100.');
		return false;
	}
	var unweightedTopScore = 0;
	var unweightedBotScore = 0;
	var finalScore = (num1/num2)*weightElem.value;
	for(var i = 0;i<weights.length;i++){
		if(weights[i].weight == 0){
			unweightedTopScore += weights[i].topScore;
			unweightedBotScore += weights[i].botScore;
		}else{
			finalScore += (weights[i].topScore/weights[i].botScore)*weights[i].weight;
		}
	}
	allWeights.push(parseFloat(weightElem.value));
	if(sumList(allWeights) > 100){
		console.log(allWeights);
		alert('Please use weights that do not exceed 100.');
		return false;
	}
	finalScore += (100-sumList(allWeights))*(unweightedTopScore/unweightedBotScore);
	return finalScore;
};

but.onclick = function(){
	num1 = document.getElementById("num1").value;
	num2 = document.getElementById("num2").value;
	tops.push(parseInt(num1));
	bots.push(parseInt(num2));
	var weightedString = '';
	if(document.getElementById('weight').value != ''){
		weightedString = '<br/>Weighted, your score is '+weighGrades().toFixed(4)+'%';
	}
	p.innerHTML = "If you scored a "+num1+" out of "+num2+" your grade would be "+((sumList(tops)/sumList(bots))*100).toFixed(4)+"%"+weightedString;
}
function sumList(arr){
	var sum = 0;
	for(var i = 0;i<arr.length;i++){
		sum += arr[i];
	}
	return sum;
}

function necessaryGrade(finalGrade, realTopSum, realBotSum, possiblePoints){
	if(isNaN(parseInt(finalGrade))|| isNaN(parseInt(possiblePoints))){
		return "Please use numerical values.";
	}
	return [(realBotSum+possiblePoints)*((finalGrade-0.5)/100)-realTopSum,possiblePoints];
}
but2.onclick = function(){
	var ng = necessaryGrade(parseInt(document.getElementById("final_grade").value),sumList(tops), sumList(bots), parseInt(document.getElementById("possible_points").value));
	if(ng.indexOf("Please")){
		necessaryScore.innerHTML = "You'd need at least "+ng[0].toFixed(1)+" points on this assignment ("+(ng[0]/ng[1]).toFixed(3)*100+"%) to finish with that grade.";
	}else{
		necessaryScore.innerHTML = ng;
	}
}
