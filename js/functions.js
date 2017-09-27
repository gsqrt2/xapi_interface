var lrs;
var statement;
var queryInfo = {
	    active: true,
	    currentWindow: true
	  };
var userData = {
				name:"",
				email: "",
				lrs_username: "",
				lrs_password: "",
				lrs_endpoint: ""
				};




chrome.storage.sync.get(userData, (stored_data) => {
    initData(chrome.runtime.lastError ? null : stored_data);
  });

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
	//document.getElementById("statementVerbSpan").innerHTML = document.getElementById("verbDropdown").options[document.getElementById("verbDropdown").selectedIndex].text;
	//document.getElementById("statementObjectSpan").innerHTML = " this "+document.getElementById("objectDropdown").options[document.getElementById("objectDropdown").selectedIndex].text;
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
}

function prepareStatement(){
	if(userData.lrs_username.trim() != "" && userData.lrs_endpoint.trim() != "")
	{
		statement = new TinCan.Statement(
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
	}
	else
	{
		alert("No username or endpoint");
	}
}

function sendStatement(){

	
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
	    console.log("Failed to setup LRS object: ", ex);
	    // TODO: do something with error, can't communicate with LRS
	}
	
	lrs.saveStatement(
		    statement,
		    {
		        callback: function (err, xhr) {
		            if (err !== null) {
		                if (xhr !== null) {
		                    alert("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
		                    // TODO: do something with error, didn't save statement
		                    return;
		                }

		                alert("Failed to save statement: " + err);
		                // TODO: do something with error, didn't save statement
		                return;
		            }

		            alert("Statement saved");
		            // TOOO: do something with success (possibly ignore)
		        }
		    }
		);	
}

function collectContentInfo(){
	
	//alert(text);
}


document.addEventListener('DOMContentLoaded', () => {
	    var settingsButton = document.getElementById('actorSettingsButton');
	    var settingsCancelButton = document.getElementById('settings_cancel_button');
	    var settingsSaveButton = document.getElementById('settings_save_button');
	    var submitButton = document.getElementById("submitButton");
	    var objectDropdown = document.getElementById("objectDropdown");
	    var verbDropdown = document.getElementById("verbDropdown");

	   
	    
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
	    	prepareStatement();
	    	sendStatement();
	    });
	    
	    verbDropdown.addEventListener('change', () => {
	    	document.getElementById("statementVerbSpan").innerHTML = document.getElementById("verbDropdown").options[document.getElementById("verbDropdown").selectedIndex].text;
	    });
	    
	    objectDropdown.addEventListener('change', () => {
	    	document.getElementById("statementObjectSpan").innerHTML = " this "+document.getElementById("objectDropdown").options[document.getElementById("objectDropdown").selectedIndex].text;
	    });
	    
	    collectContentInfo();
	    
	    
	});