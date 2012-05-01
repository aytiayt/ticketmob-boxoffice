
$(document).bind("mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
});

$(document).ready(function() {
    // For testing
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
	// End for testing
	
	
	// create a store
	var data = new Lawnchair('data');

	// look to see if brand property and userid are stored in local store already, if so, we can log the person in and skip login.
	data.get('settings',function(result) {
		var doLogin = true;
		if(result) {
			//console.log(result.userID);
			//console.log(result.brandProperty);
			if(result.userID > 0 && result.brandProperty.length > 0) {
				doLogin = false;
			}
		}
		
		if(doLogin) {

			// Go to Login Screen
			$.mobile.changePage($("#loginPage"), { transition: "none"} );

		} else {
			
			// Log in the user
			var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=userinfo&userID='+result.userID+'&brandProperty='+result.brandProperty+'&callback=?'
			$.getJSON(surl, function(data) {
				
				console.log(data);
				
				var settings = { 
					key: 'settings', 
					brandProperty: data.BRANDPROPERTY, 
					datasource: data.DATASOURCE, 
					userID: data.USERID, 
					firstName: data.FIRSTNAME, 
					lastName: data.LASTNAME, 
					emailAddress: data.EMAILADDRESS, 
					userType: data.USERTYPE, 
					venueID: data.VENUEID, 
					venueName: data.VENUENAME };
				
				//data.save(settings);
				
				$.mobile.changePage($("#dashboardPage"), { transition: "none"} );

			});
			
		}
		
	});
	
	
	
	
	
	$('#loginButton').click(function() {
		
		var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=userlogin&username='+$('#username').val()+'&password='+$('#password').val()+'&brandProperty='+$('input[name="brandProperty"]:checked').val()+'&callback=?'
		
		$.getJSON(surl, function(data) {
			
			console.log(data);
			
			if(data.SUCCESS) {
			
				var settings = { 
					key: 'settings', 
					brandProperty: data.BRANDPROPERTY, 
					datasource: data.DATASOURCE, 
					userID: data.USERID, 
					firstName: data.FIRSTNAME, 
					lastName: data.LASTNAME, 
					emailAddress: data.EMAILADDRESS, 
					userType: data.USERTYPE, 
					venueID: data.VENUEID, 
					venueName: data.VENUENAME };
					
				var data = new Lawnchair('data');
				
				data.save(settings,function(){
					$('#username').val('');
					$('#password').val('');
					$.mobile.changePage($("#dashboardPage"), { transition: "none"} );
				});
			
			} else {
				
				$('#password').val('');
				
				showAlert('Login Error','Bad Username/Password','Sorry, the username/password combination you entered was not recognized. Please try again.','back');
				
			}

		});	
		
		return false;
		
	});
	
	$('.logoutBtn').click(function() {
		var data = new Lawnchair('data');
		data.nuke(function(){
			$.mobile.changePage($("#loginPage"), { transition: "none"} );
		});
	});
	
	
});


var showAlert = function(dataTitle,title,content,dataRel) {
	$('#alertBox').attr('data-title',dataTitle);
	$('h3.alert-1','#alertBox').html(title);
	$('p.alert-2','#alertBox').html(content);
	$('a.alert-ok','#alertBox').attr('data-rel',dataRel);
	$.mobile.changePage("#alertBox");
}

