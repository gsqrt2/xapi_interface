var lrs;
var currentUrl = null;

var queryInfo = {
	    active: true,
	    currentWindow: true
	  };


function initData(result){
	if(result != null)
		userData = result;		

	fillFromUserData();

}

function fillFromUserData(){
	document.getElementById("name_input").value = userData.name;
	document.getElementById("name_span").innerHTML = (userData.name.trim() != "" ? userData.name : "Your Name");
	document.getElementById("email_input").value = userData.email;
	
	document.getElementById("username_input").value = userData.lrs_username;
	document.getElementById("userpass_input").value = "           ";
	document.getElementById("endpoint_input").value = userData.lrs_endpoint;
	
	document.getElementById("statementNameSpan").innerHTML = (userData.name.trim() != "" ? userData.name : "The user");
	
	chrome.tabs.query(queryInfo, (tabs) => {
		var tab = tabs[0];
		var url = tab.url;
		if(typeof url == 'string'){
			var urlRegex = /^(https?:\/\/)?(?:[^@\/\n]+@)?(www\.)?([^:\/\n]+)/;
			var matches = urlRegex.exec(url);
			currentUrl = matches[3];	
		}
		
		presetStatementOptions();
	});

}

function presetStatementOptions(){
	if(userData.urls[currentUrl] != null){
		document.getElementById("verbDropdown").value = userData.urls[currentUrl].verb;
		document.getElementById("statementVerbSpan").innerHTML = document.getElementById("verbDropdown").options[document.getElementById("verbDropdown").selectedIndex].text;		
		document.getElementById("objectDropdown").value = userData.urls[currentUrl].object;
		document.getElementById("statementObjectSpan").innerHTML = " this "+document.getElementById("objectDropdown").options[document.getElementById("objectDropdown").selectedIndex].text;		
	}
	else{
		document.getElementById("verbDropdown").selectedIndex = 0;
		document.getElementById("objectDropdown").selectedIndex = 0;
		document.getElementById("outputSpan").innerHTML = "&nbsp;";	
		document.getElementById("statementNameSpan").innerHTML = (userData.name.trim() != "" ? userData.name : "The user");
		document.getElementById("statementVerbSpan").innerHTML = "(select verb)";
		document.getElementById("statementObjectSpan").innerHTML = " this (select object)";
	}
}


function settingsCancel(){
	
	document.getElementById("settingsTab").style.display = "none";
	document.getElementById("mainTab").style.display = "block";
	fillFromUserData();
}

function saveData(){
	userData.name = document.getElementById('name_input').value.trim();
	userData.email = document.getElementById('email_input').value.trim();
	userData.lrs_username = document.getElementById('username_input').value.trim();
	if(document.getElementById('userpass_input').value != "           ")
		userData.lrs_password = document.getElementById('userpass_input').value;
	userData.lrs_endpoint = document.getElementById("endpoint_input").value.trim();
	
	chrome.storage.sync.set(userData);
	fillFromUserData();
	
	document.getElementById("settingsTab").style.display = "none";
	document.getElementById("mainTab").style.display = "block";
	
	outputMessage("Settings saved.", "positive", 2000);
	
}

function prepareStatement(){
	if(userData.lrs_username.trim() != "" && userData.lrs_endpoint.trim() != "" && userData.email != "")
	{
		
		var statement = new TinCan.Statement(
					{
				    "actor": {
				        "mbox": "mailto:"+userData.email,
				        "name": ""+(userData.name != "" ?userData.name : userData.email),
				        "objectType": "Agent"
				    },
				    "verb": {
				        "id": ""+document.getElementById("verbDropdown").value,
				        "display": {
				            "en-US": ""+document.getElementById("verbDropdown").options[document.getElementById("verbDropdown").selectedIndex].text
				        }
				    },
				    "object": {
				    	"objectType": "Activity",
				        "id": "http://www.the_iri_of_the_activity.eu/test",//+document.getElementById("objectDropdown").value,
				        "definition": {
				            "name": {
				                "en-US": "activity name from content"
				            },
				            "description": {
				                "en-US": "activity description from content"
				            },
				            "type": document.getElementById("objectDropdown").value,
				            "moreInfo": "http://www.moreinfo.maybe"
				        }
				        
				    }
				}
			);
		
		return statement;
	}
	else
	{
		outputMessage("Please fill all required fields in the 'Profile Settings' section.", "negative");
		return null;
	}
}

function sendStatement(statement){

	outputMessage("Sending statement...", "neutral");
	try {
	    lrs = new TinCan.LRS(
	        {
	            endpoint: (userData.lrs_endpoint.charAt(userData.lrs_endpoint.length-1) == "/" ? userData.lrs_endpoint.slice(0, userData.lrs_endpoint.length-1) : userData.lrs_endpoint),
	            username: userData.lrs_username,
	            password: userData.lrs_password,
	            allowFail: false
	        }
	    );
	}
	catch (ex) {
	    outputMessage("Failed to setup LRS object: "+ ex, negative);
	}
	
	lrs.saveStatement(
		    statement,
		    {
		        callback: function (err, xhr) {
		            if (err !== null) {
		                if (xhr !== null) {
		                    outputMessage("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")", "negative");
		                    return;
		                }

		                outputMessage("Failed to save statement: " + err, "negative");
		                return;
		            }

		            outputMessage("Statement saved in your LRS!", "positive");
		            
		            if(currentUrl != null){
		            	
		            	var newKnownUrl = {"verb":document.getElementById("verbDropdown").value, "object":document.getElementById("objectDropdown").value};
		            	if(userData.urls == null){
		            		var urls = {};
		            		userData.usrls = urls;
		            	}
		            		
		            	userData.urls[currentUrl] = newKnownUrl;
		            	chrome.storage.sync.set(userData);
		            }
		            	
		            
		            document.getElementById("submitButton").style.display = "none";
		            document.getElementById("resetButton").style.display = "block";
		        }
		    }
		);	
}

function collectContentInfo(){
	
	chrome.runtime.onMessage.addListener(
		function(result, sender, sendResponse) {
  		  
  			 // alert(sender.id+" - "+result.value);
  		  
	});
	chrome.tabs.executeScript(null, {file: "js/content_script.js", runAt: "document_end"});
}

function outputMessage(message, attitude, mseconds){
	
	if(attitude == "positive"){
		document.getElementById("outputSpan").classList.remove("neutral");
		document.getElementById("outputSpan").classList.remove("negative");
		document.getElementById("outputSpan").classList.add("positive");
	}
	else
	if(attitude == "negative"){
		document.getElementById("outputSpan").classList.remove("neutral");
		document.getElementById("outputSpan").classList.remove("positive");
		document.getElementById("outputSpan").classList.add("negative");
	}
	else
	if(attitude == "neutral"){
		document.getElementById("outputSpan").classList.remove("negative");
		document.getElementById("outputSpan").classList.remove("positive");
		document.getElementById("outputSpan").classList.add("neutral");
	}
	
	
	
	document.getElementById("outputSpan").innerHTML = message;
	
	if(mseconds != null)
		setTimeout(function(){ document.getElementById("outputSpan").innerHTML = "&nbsp;"; }, mseconds);
}

function resetForm(){
	document.getElementById("outputSpan").innerHTML = "&nbsp;";
	document.getElementById("resetButton").style.display = "none";
	document.getElementById("submitButton").style.display = "block";
	presetStatementOptions();
}


document.addEventListener('DOMContentLoaded', () => {
	    var settingsButton = document.getElementById('actorSettingsButton');
	    var settingsCancelButton = document.getElementById('settings_cancel_button');
	    var settingsSaveButton = document.getElementById('settings_save_button');
	    var resetButton = document.getElementById("resetButton");
	    var submitButton = document.getElementById("submitButton");
	    var objectDropdown = document.getElementById("objectDropdown");
	    var verbDropdown = document.getElementById("verbDropdown");
	    
	    chrome.storage.sync.get(userData, (stored_data) => {
	        initData(chrome.runtime.lastError ? null : stored_data);
	      });
	   
	    
	    settingsButton.addEventListener('click', () => {
	    	document.getElementById("mainTab").style.display = "none";
	    	document.getElementById("settingsTab").style.display = "block";
	    });
	    
	    
	    settingsCancelButton.addEventListener('click', () => {   	
	    	settingsCancel();
	    });
	    
	    settingsSaveButton.addEventListener('click', () => {   	
	    	saveData();
	    });
	    
	    submitButton.addEventListener('click', () => {
	    	
	    	if(document.getElementById("verbDropdown").value != "" && document.getElementById("objectDropdown").value != ""){
	    		var statement;
	    		if(statement = prepareStatement())
	    			sendStatement(statement);
	    	}
	    	else{
	    		outputMessage("Please select a verb & an object for your statement.", "neutral", 3000);
	    	}
	    });
	    
	    verbDropdown.addEventListener('change', () => {
	    	document.getElementById("statementVerbSpan").innerHTML = document.getElementById("verbDropdown").options[document.getElementById("verbDropdown").selectedIndex].text;
	    });
	    
	    objectDropdown.addEventListener('change', () => {
	    	document.getElementById("statementObjectSpan").innerHTML = " this "+document.getElementById("objectDropdown").options[document.getElementById("objectDropdown").selectedIndex].text;
	    });
	    
	    resetButton.addEventListener('click', () => {
	    	resetForm();
	    });
	    
	    

	    
	    collectContentInfo();
	     
	});