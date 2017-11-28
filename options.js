var chekt = document.getElementById('chekt');

chekt.onclick = function(){
	chrome.storage.sync.set({'age':this.checked});
}
chrome.storage.sync.get('age',function(d){
	chekt.checked = d['age'];
});

