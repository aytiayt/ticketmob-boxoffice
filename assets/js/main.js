
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
					
	
	// For testing on firefox				
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
		userLogin($('#username').val(),$('#password').val(),$('input[name="brandProperty"]:checked').val());
		return false;
	});
	
	$('.logoutBtn').click(function() {
		userLogout();
	});
	
	
});


var userLogin = function(username,password,brandProperty) {
	
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=userlogin&username='+username+'&password='+password+'&brandProperty='+brandProperty+'&callback=?';
		
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
			defaultAllPages();

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
			$.mobile.changePage($("#loginPage"), { transition: "none"} );
			showAlert('Bad Username/Password','Sorry, the username/password combination you entered was not recognized. Please try again.');
			
		}

	});		
}




var userLogout = function() {
	var data = new Lawnchair('data');
	data.nuke(function(){
		clearAllPages();
		$.mobile.changePage($("#loginPage"), { transition: "none"} );
	});	
}



var showAlert = function(title,content) {
	$('h3.alert-1','#alertBox').html(title);
	$('p.alert-2','#alertBox').html(content);
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
	populateUserFields();
	defaultDashboard();
	defaultSellTicket();
	defaultCalendar();
	defaultSearch();
	defaultReports();
	defaultSettings();
}



var defaultDashboard = function() {

	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=dashboardcontent&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&brandProperty='+$.boxofficeUser.brandProperty+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#dashboardPageContent').html(data.HTML).trigger("create");
			$.mobile.hidePageLoadingMsg();
		}
	});
	
}



var defaultSellTicket = function() {
	
}



var defaultCalendar = function() {
	
}



var defaultSearch = function() {
	
}



var defaultReports = function() {
	
}



var defaultSettings = function() {

	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=settingscontent&venueID='+$.boxofficeUser.venueID+'&venuesOwned='+$.boxofficeUser.venuesOwned+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#settingsPageContent').html(data.HTML).trigger("create");
		}
	});
	
}



var showInfo = function(showTimingID) {
	
	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=showinfo&showTimingID='+showTimingID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			showAlert('Show/Event Information',data.HTML);
			$('p.alert-2','#alertBox').html(data.HTML);
			$('a.alert-ok','#alertBox').show();
			$.mobile.hidePageLoadingMsg();
		}
	});
	
}



var updateSelectedVenue = function() {
	
	$.boxofficeUser.venueID = $('#venueID').val();
	$.boxofficeUser.venueName = $('#venueID option:selected').text();
	
	var user = { 
		key: 'user', 
		brandProperty: $.boxofficeUser.brandProperty, 
		datasource: $.boxofficeUser.datasource, 
		userID: $.boxofficeUser.userID, 
		firstName: $.boxofficeUser.firstName, 
		lastName: $.boxofficeUser.lastName, 
		emailAddress: $.boxofficeUser.emailAddress, 
		userType: $.boxofficeUser.userType, 
		venueID: $.boxofficeUser.venueID, 
		venueName: $.boxofficeUser.venueName,
		venuesOwned: $.boxofficeUser.venuesOwned };
		
	var data = new Lawnchair('data');
	
	data.save(user,function(){
		defaultAllPages();
	});

}



var clearAllPages = function() {
	// clear all the page views
	clearDashboard();
	clearSellTicket();
	clearCalendar();
	clearSearch();
	clearReports();
	clearSettings();
}
var clearDashboard = function() {
	$('#dashboardPageContent').html('');
}
var clearSellTicket = function() {
	$('#sellTicketPageContent').html('');
}
var clearCalendar = function() {
	$('#calendarPageContent').html('');
}
var clearSearch = function() {
	$('#searchPageContent').html('');
}
var clearReports = function() {
	$('#reportsPageContent').html('');
}
var clearSettings = function() {
	$('#settingsPageContent').html('');
}

