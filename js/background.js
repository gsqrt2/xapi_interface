// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
	//var pattern = /^(http(s?):\/\/)?(www\.)?youtu(be)?\.([a-z])+\/(watch(.*?)(\?|\&)v=)?(.*?)(&(.)*)?$/i;
  //alert(pattern.exec(tab.url)[9]);
	var username = "gsqrt2@gmail.com";
	var password = "Demo123!";
	
	var endpoint = "https://cloud.scorm.com/tc/COSS8P6M3N/statements";
	var statement = {
		    "actor": {
		        "mbox": "mailto:gsqrt2@gmail.com",
		        "name": "geo mar",
		        "objectType": "Agent"
		    },
		    "verb": {
		        "id": "http://adlnet.gov/expapi/verbs/answered",
		        "display": {
		            "en-US": "answered"
		        }
		    },
		    "object": {
		        "id": "http://adlnet.gov/expapi/activities/example",
		        "definition": {
		            "name": {
		                "en-US": "Example Activity"
		            },
		            "description": {
		                "en-US": "Example activity description"
		            }
		        },
		        "objectType": "Activity"
		    }
		};
  
	
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
            
           alert("success: "+this.responseText);
      }

    };
	
	xhr.open('POST', endpoint);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	xhr.setRequestHeader('Authorization','Basic Z3NxcnQyQGdtYWlsLmNvbTpEZW1vMTIzIQ==');
	xhr.setRequestHeader('X-Experience-API-Version', '1.0.1');
	var jsonStr = JSON.stringify(statement);
//	xhr.send(jsonStr);
  
  //alert(statement);
  
  
 // chrome.tabs.executeScript({
    //function(){alert('lala');}
 // });
  
});


