
$(document).bind("mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
});

$(document).ready(function() {
    
	// For testing since there is no mobileinit on desktop
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
	// End for testing
	
	
	// Local jQuery data structs for app
	$.boxofficeUser = {};
	$.boxofficeUser.brandProperty = "";
	$.boxofficeUser.datasource = "";
	$.boxofficeUser.userID = 0;
	$.boxofficeUser.firstName = "";
	$.boxofficeUser.lastName = "";
	$.boxofficeUser.emailAddress = "";
	$.boxofficeUser.userType = 0;
	$.boxofficeUser.venueID = 0;
	$.boxofficeUser.venueName = "";
	$.boxofficeUser.venuesOwned = "";
					
					
	if (navigator.userAgent.indexOf("Firefox")!=-1) {
		/* For Firefox Testing */	
		$.boxofficeUser.brandProperty = "LS";
		$.boxofficeUser.datasource = "LaughStub";
		$.boxofficeUser.userID = 13673662;
		$.boxofficeUser.firstName = "Pathik";
		$.boxofficeUser.lastName = "Shah";
		$.boxofficeUser.emailAddress = "pathik@abstraktdesigns.com";
		$.boxofficeUser.userType = 3;
		$.boxofficeUser.venueID = 277;
		$.boxofficeUser.venueName = "LS Test Venue";
		$.boxofficeUser.venuesOwned = "";
		defaultAllPages();
		populateUserFields();
		$.mobile.changePage($("#dashboardPage"), { transition: "none"} );	
	}

	
	
	// create a store
	var data = new Lawnchair('data');

	// look to see if brand property and userid are stored in local store already, if so, we can log the person in and skip login.
	data.get('user',function(result) {
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
			var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=userinfo&userID='+result.userID+'&brandProperty='+result.brandProperty+'&callback=?';
			$.getJSON(surl, function(data) {
				
				//console.log(data);
				
				$.boxofficeUser.brandProperty = data.BRANDPROPERTY;
				$.boxofficeUser.datasource = data.DATASOURCE;
				$.boxofficeUser.userID = data.USERID;
				$.boxofficeUser.firstName = data.FIRSTNAME;
				$.boxofficeUser.lastName = data.LASTNAME;
				$.boxofficeUser.emailAddress = data.EMAILADDRESS;
				$.boxofficeUser.userType = data.USERTYPE;
				$.boxofficeUser.venueID = data.VENUEID;
				$.boxofficeUser.venueName = data.VENUENAME;
				$.boxofficeUser.venuesOwned = data.VENUESOWNED;

				// set all the venue and user name display
				defaultAllPages();
				
				
				populateUserFields();

				/*
				// Store in Lawnchair
				var user = { 
					key: 'user', 
					brandProperty: data.BRANDPROPERTY, 
					datasource: data.DATASOURCE, 
					userID: data.USERID, 
					firstName: data.FIRSTNAME, 
					lastName: data.LASTNAME, 
					emailAddress: data.EMAILADDRESS, 
					userType: data.USERTYPE, 
					venueID: data.VENUEID, 
					venueName: data.VENUENAME,
					venuesOwned: data.VENUESOWNED };
				
				data.save(user,function(){});
				*/
				
				$.mobile.changePage($("#dashboardPage"), { transition: "none"} );	

			});
			
		}
		
	});
	
	
	
	
	
	$('#loginButton').click(function() {
		
		var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=userlogin&username='+$('#username').val()+'&password='+$('#password').val()+'&brandProperty='+$('input[name="brandProperty"]:checked').val()+'&callback=?';
		
		$.getJSON(surl, function(data) {
			
			//console.log(data);
			
			if(data.SUCCESS) {
			
				$.boxofficeUser.brandProperty = data.BRANDPROPERTY;
				$.boxofficeUser.datasource = data.DATASOURCE;
				$.boxofficeUser.userID = data.USERID;
				$.boxofficeUser.firstName = data.FIRSTNAME;
				$.boxofficeUser.lastName = data.LASTNAME;
				$.boxofficeUser.emailAddress = data.EMAILADDRESS;
				$.boxofficeUser.userType = data.USERTYPE;
				$.boxofficeUser.venueID = data.VENUEID;
				$.boxofficeUser.venueName = data.VENUENAME;
				$.boxofficeUser.venuesOwned = data.VENUESOWNED;

				// set all the venue and user name display
				populateUserFields();

				// Store in Lawnchair
				var user = { 
					key: 'user', 
					brandProperty: data.BRANDPROPERTY, 
					datasource: data.DATASOURCE, 
					userID: data.USERID, 
					firstName: data.FIRSTNAME, 
					lastName: data.LASTNAME, 
					emailAddress: data.EMAILADDRESS, 
					userType: data.USERTYPE, 
					venueID: data.VENUEID, 
					venueName: data.VENUENAME,
					venuesOwned: data.VENUESOWNED };
					
				var data = new Lawnchair('data');
				
				data.save(user,function(){
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



var populateUserFields = function() {
	$('span.venueName').html($.boxofficeUser.venueName);
	$('span.userFirstName').html($.boxofficeUser.firstName);
	$('span.userLastName').html($.boxofficeUser.lastName);
	$('span.userEmail').html($.boxofficeUser.emailAddress);
}



var defaultAllPages = function() {
	// set the default page views
	defaultDashboard();
}



var defaultDashboard = function() {

	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=dashboardcontent&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&brandProperty='+$.boxofficeUser.brandProperty+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#dashboardPageContent').html(data.HTML);
		}
	});
	
}



var showInfo = function(showTimingID) {
	
	$('#alertBox').attr('data-title','');
	$('h3.alert-1','#alertBox').html('Show/Event Information');
	$('p.alert-2','#alertBox').html('');
	$('a.alert-ok','#alertBox').attr('data-rel','back').hide();
	$.mobile.changePage("#alertBox");
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=showinfo&showTimingID='+showTimingID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('p.alert-2','#alertBox').html(data.HTML);
			$('a.alert-ok','#alertBox').show();
		}
	});
	
}



