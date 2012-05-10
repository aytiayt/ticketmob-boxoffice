
$(document).bind("mobileinit", function() {
	
    // Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.useFastClick = true;
	
});


$(document).ready(function() {


	// Local jQuery data structs for app
	$.boxofficeUser = {};
	$.boxofficeUser.brandProperty = "";
	$.boxofficeUser.brandPropertySite = "";
	$.boxofficeUser.datasource = "";
	$.boxofficeUser.userID = 0;
	$.boxofficeUser.firstName = "";
	$.boxofficeUser.lastName = "";
	$.boxofficeUser.emailAddress = "";
	$.boxofficeUser.userType = 0;
	$.boxofficeUser.venueID = 0;
	$.boxofficeUser.venueName = "";
	$.boxofficeUser.venuesOwned = "";
					
	$.boxofficeSettings = {};
	$.boxofficeSettings.landscapePage = 'dashboardPage';
	$.boxofficeSettings.currOrientation = 'landscape';
	$.boxofficeSettings.defaultCheckIn = false;
 
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
		
			$.boxofficeUser.brandProperty = result.brandProperty;
			$.boxofficeUser.brandPropertySite = result.brandPropertySite;
			$.boxofficeUser.datasource = result.datasource;
			$.boxofficeUser.userID = result.userID;
			$.boxofficeUser.firstName = result.firstName;
			$.boxofficeUser.lastName = result.lastName;
			$.boxofficeUser.emailAddress = result.emailAddress;
			$.boxofficeUser.userType = result.userType;
			$.boxofficeUser.venueID = result.venueID;
			$.boxofficeUser.venueName = result.venueName;
			$.boxofficeUser.venuesOwned = result.venuesOwned;

			// set up the default views
			defaultAllPages();
			
			$.mobile.changePage($("#dashboardPage"), { transition: "none"} );
			
			//Testing:
			//$.mobile.changePage($("#searchPage"), { transition: "none"} );	
		
		}
		
	});
	
	// create a store for settings
	var settings = new Lawnchair('settings');

	// look to see if brand property and userid are stored in local store already, if so, we can log the person in and skip login.
	settings.get('preferences',function(result) {
		//console.log(result);
		if(result) {
			$.boxofficeSettings.defaultCheckIn = result.defaultCheckIn;
		}
		defaultSettings();
	});

	
	$('#loginButton').click(function() {
		userLogin($('#username').val(),$('#password').val(),$('input[name="brandProperty"]:checked').val());
		return false;
	});
	
	$('.logoutBtn').click(function() {
		userLogout();
	});


	
	$(window).bind('orientationchange', function(e) {
		if($.boxofficeUser.userID > 0) {
			if(e.orientation == "portrait") {
				$.boxofficeSettings.currOrientation = 'portrait';
				//$('#ticketholdersPageContent').trigger('create');
				$.mobile.changePage($("#ticketholdersPage"), { transition: "none"} );
				if($("#ticketholdersPageContent").html().length==0){
					navigateTicketHolders(0);	
				}
			} else {
				//landscape
				$.boxofficeSettings.currOrientation = 'landscape';
				$.mobile.changePage($("#"+$.boxofficeSettings.landscapePage), { transition: "none"} );
			}
		}
	});

});


$(document).bind("pagebeforechange",function(event, data) {
	//$.mobile.showPageLoadingMsg();
});

$(document).bind("pagechange",function(event, data) {
	//$.mobile.hidePageLoadingMsg();
	// set current view for orientation changing back and forth
	if(data.toPage.attr("id")!="ticketholdersPage") {
		$.boxofficeSettings.landscapePage = data.toPage.attr("id");
	}
	
});


var userLogin = function(username,password,brandProperty) {
	
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=userlogin&username='+username+'&password='+password+'&brandProperty='+brandProperty+'&callback=?';
		
	$.getJSON(surl, function(data) {
		
		//console.log(data);
		if(data.SUCCESS) {
		
			$.boxofficeUser.brandProperty = data.BRANDPROPERTY;
			$.boxofficeUser.brandPropertySite = data.BRANDPROPERTYSITE;
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
				brandPropertySite: data.BRANDPROPERTYSITE, 
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



var initShowSwipe = function(pageContentID) {
				
	var showWidth = eval( parseInt( $('ul.showOverview > li','#'+pageContentID).size() ) * 249);
	$('#'+pageContentID).css('width',showWidth);
			
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

	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=dashboardcontent&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&brandProperty='+$.boxofficeUser.brandProperty+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#dashboardPageContent').html(data.HTML).trigger("create");
			initShowSwipe('dashboardPageContent');
		}
	});
	
}



var defaultSellTicket = function() {
	navigateSellTicket(0,0,0,false,false);
}

var navigateSellTicket = function(showTimingID,qty,showTierID,changePage,showLoading) {

	if(showLoading) {
		$.mobile.showPageLoadingMsg();
	}
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=sellticket&venueID='+$.boxofficeUser.venueID+'&showTimingID='+showTimingID+'&qty='+qty+'&showTierID='+showTierID+'&datasource='+$.boxofficeUser.datasource+'&brandProperty='+$.boxofficeUser.brandProperty+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$("#sellTicketPageContent").html(data.HTML).trigger("create");
			if(showLoading) {
				$.mobile.hidePageLoadingMsg();
			}
			if(changePage) {
				$.mobile.changePage($("#sellTicketPage"), { transition: "none"} );
			}
		}
	});
	
}



var defaultCalendar = function() {

	var now = new Date();
	navigateCalendar('month',now.format("mm/dd/yyyy"));
	
}

var navigateCalendar = function(view,date) {

	switch(view){
		case 'day':
			var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=calendarday&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&brandProperty='+$.boxofficeUser.brandProperty+'&showDate='+date+'&callback=?';
			$.getJSON(surl, function(data) {
				if(data.SUCCESS) {
					$("#calendarDayPageContent").html(data.HTML).trigger("create");
					initShowSwipe('calendarDayPageContent');
					$.mobile.changePage($("#calendarDayPage"), { transition: "none"} );
				}
			});
			break;
		default:
			var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=calendarcontent&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&startDate='+date+'&callback=?';
			$.getJSON(surl, function(data) {
				//console.log(data);
				if(data.SUCCESS) {
					$('#calendarPageContent').html(data.HTML).trigger("create");
				}
			});
			break;
	}
	
}



var defaultSearch = function() {
	
	var searchPageContent = ' \
		<form id="customerSearchForm"> \
			<div class="ui-grid-b"> \
				<div class="ui-block-a"> \
					<div data-role="fieldcontain"> \
						<label for="searchFirstName">First Name</label> \
						<input type="text" name="searchFirstName" id="searchFirstName" value="" /> \
					</div> \
				</div> \
				<div class="ui-block-b"> \
					<div data-role="fieldcontain"> \
						<label for="searchLastName">Last Name</label> \
						<input type="text" name="searchLastName" id="searchLastName" value="" /> \
					</div> \
				</div> \
				<div class="ui-block-c"> \
					<div data-role="fieldcontain"> \
						<label for="searchEmail">Email Address</label> \
						<input type="text" name="searchEmail" id="searchEmail" value="" /> \
					</div> \
				</div> \
				<div class="ui-block-a"> \
					<div data-role="fieldcontain"> \
						<label for="searchPaymentID">Order Number</label> \
						<input type="number" name="searchPaymentID" id="searchPaymentID" value="" /> \
					</div> \
				</div> \
				<div class="ui-block-b"> \
					<div data-role="fieldcontain"> \
						<label for="searchTicketID">Ticket Number</label> \
						<input type="number" name="searchTicketID" id="searchTicketID" value="" placeholder="9 Digit Number" /> \
					</div> \
				</div> \
				<div class="ui-block-b"> \
					<div data-role="fieldcontain"> \
						<label for="searchCreditCard">Credit Card</label> \
						<input type="number" name="searchCreditCard" id="searchCreditCard" value="" /> \
					</div> \
				</div> \
				<div class="ui-block-a"> \
					<div data-role="fieldcontain"> \
						<label for="searchDateFrom">Date From</label> \
						<input type="text" name="searchDateFrom" id="searchDateFrom" value="" placeholder="mm/dd/yyyy" maxlength="10" onkeyup="mask_onValueChanged();" onfocus="mask_onSetFocus(this, \'99/99/9999\');" onblur="mask_onKillFocus();" /> \
					</div> \
				</div> \
				<div class="ui-block-b"> \
					<div data-role="fieldcontain"> \
						<label for="searchDateTo">Date To</label> \
						<input type="text" name="searchDateTo" id="searchDateTo" value="" placeholder="mm/dd/yyyy" maxlength="10" onkeyup="mask_onValueChanged();" onfocus="mask_onSetFocus(this, \'99/99/9999\');" onblur="mask_onKillFocus();" /> \
					</div> \
				</div> \
				<div class="ui-block-b"> \
					<div data-role="fieldcontain"> \
						<input type="button" data-theme="b" name="submitCustomerSearch" id="submitCustomerSearch" value="Search Customers" onClick="searchCustomers();" /> \
					</div> \
				</div> \
			</div> \
		</form> \
		<div id="customerSearchResults"></div>';
		
	$('#searchPageContent').html(searchPageContent).trigger('create');
}

var searchCustomers = function() {
	
	$.mobile.showPageLoadingMsg();

	var queryString = 'method=searchcustomers';
		queryString = queryString + '&datasource='+$.boxofficeUser.datasource;
		queryString = queryString + '&firstName='+$('#searchFirstName').val();
		queryString = queryString + '&lastName='+$('#searchLastName').val();
		queryString = queryString + '&emailAddress='+$('#searchEmail').val();
		queryString = queryString + '&paymentID='+$('#searchPaymentID').val();
		queryString = queryString + '&ticketID='+$('#searchTicketID').val();
		queryString = queryString + '&creditCard='+$('#searchCreditCard').val();
		queryString = queryString + '&dateFrom='+$('#searchDateFrom').val();
		queryString = queryString + '&dateTo='+$('#searchDateTo').val();
		queryString = queryString + '&venueID='+$.boxofficeUser.venueID;
		queryString = queryString + '&callback=?';

	var surl = 'https://www.ticketmob.com/ipadbo/services.cfc?'+queryString;
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#customerSearchResults').html(data.HTML).trigger("create");
		}
		$.mobile.hidePageLoadingMsg();
	});
	
}






var defaultReports = function() {
	$('#reportsPageContent').html('<input type="hidden" name="reportShowTimingID" id="reportShowTimingID" value="0" />');
	updateReport(false);
}



var updateReport = function(showLoading) {
	
	if(showLoading) {
		$.mobile.showPageLoadingMsg();
	}
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=getReport&venueID='+$.boxofficeUser.venueID+'&showTimingID='+$('#reportShowTimingID').val()+'&brandProperty='+$.boxofficeUser.brandProperty+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#reportsPageContent').html(data.HTML).trigger('create');
			if(showLoading) {
				$.mobile.hidePageLoadingMsg();
			}
		}
	});
	
}



var defaultSettings = function() {

	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=settingscontent&venueID='+$.boxofficeUser.venueID+'&defaultCheckIn='+$.boxofficeSettings.defaultCheckIn+'&venuesOwned='+$.boxofficeUser.venuesOwned+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#settingsPageContent').html(data.HTML).trigger("create");
		}
	});
	
}

var saveSettings = function() {
	
	$.mobile.showPageLoadingMsg();
	
	if(parseInt($('#defaultCheckIn').val())==1){
		$.boxofficeSettings.defaultCheckIn = true;
	} else {
		$.boxofficeSettings.defaultCheckIn = false;
	}
	
	var userSettings = { 
		key: 'preferences', 
		defaultCheckIn: $.boxofficeSettings.defaultCheckIn };
		
	var settings = new Lawnchair('settings');
	
	settings.save(userSettings,function(){
		$.mobile.hidePageLoadingMsg();
		
		$('#settingsForm').prepend('<div class="ui-body ui-body-e messageBox" id="settingsMessage"><p>Settings have been saved.</p></div>');
		window.setTimeout(function(){
			$('#settingsMessage').fadeOut(500,function(){
				$(this).remove();
			});
		},5000);
		
	});
	
}

var updateSelectedVenue = function() {
	
	$.mobile.showPageLoadingMsg();
	
	$.boxofficeUser.venueID = $('#venueID').val();
	$.boxofficeUser.venueName = $('#venueID option:selected').text();
	
	var user = { 
		key: 'user', 
		brandProperty: $.boxofficeUser.brandProperty,
		brandPropertySite: $.boxofficeUser.brandPropertySite, 
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
		
		populateUserFields();
		defaultDashboard();
		defaultSellTicket();
		defaultCalendar();
		defaultSearch();
		defaultReports();
		
		$.mobile.hidePageLoadingMsg();
		
		$('#settingsForm').prepend('<div class="ui-body ui-body-e messageBox" id="settingsMessage"><p>Venue has been changed.</p></div>');
		window.setTimeout(function(){
			$('#settingsMessage').fadeOut(500,function(){
				$(this).remove();
			});
		},5000);
		
	});

}



var navigateTicketHolders = function(showTimingID) {

	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=ticketholders&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&showTimingID='+showTimingID+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			if(data.PREV==0){
				$('#ticketholdersPrev').hide();
			} else {
				$('#ticketholdersPrev').attr('onclick','navigateTicketHolders('+data.PREV+');return false;').show();
			}
			if(data.NEXT==0){
				$('#ticketholdersNext').hide();
			} else {
				$('#ticketholdersNext').attr('onclick','navigateTicketHolders('+data.NEXT+');return false;').show();
			}
			$('#ticketholdersHeader').html(data.HEADER);
			$('#ticketholdersPageContent').html(data.HTML).trigger('create');
		}
		$.mobile.hidePageLoadingMsg();
	});
	
}

var filterTicketholderList = function(filterBy) {
	$('li','ul.ticketholderList').hide();
	$('li.ui-li-divider','ul.ticketholderList').show();
	
	switch(filterBy) {
		case 'willcall':
			$('li.willcall','ul.ticketholderList').show();
			break
		case 'vip':
			$('li.vip','ul.ticketholderList').show();
			break
		case 'guestlist':
			$('li.guestlist','ul.ticketholderList').show();
			break
		default:
			$('li','ul.ticketholderList').show();
			break;	
	}
}

var navigateLandscapeTicketHolders = function(showTimingID,filter) {
	navigateTicketHolders(showTimingID);
	$.mobile.changePage($("#ticketholdersLandscapePage"), { transition: "none"} );
	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=ticketholders&venueID='+$.boxofficeUser.venueID+'&datasource='+$.boxofficeUser.datasource+'&showTimingID='+showTimingID+'&filter='+filter+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#ticketholdersLandscapeHeader').html(data.HEADER);
			$('#ticketholdersLandscapePageContent').html(data.HTML).trigger('create');
		}
		filterTicketholderList(filter);
		$.mobile.changePage($("#ticketholdersLandscapePage"), { transition: "none"} );
		$.mobile.hidePageLoadingMsg();
	});
	
}


var openTicketHolderInfo = function(ticketID,msg,autoCheckIn) {
	
	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=ticketholderDetails&emailFields=false&ticketID='+ticketID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#ticketholderDetailsContent').html(data.HTML).trigger('create');
		}
		$.mobile.changePage("#ticketholderDetails");
		if(autoCheckIn) {
			checkinTicketHolder();
		}
		if(msg.length) {
			switch(msg) {
				case 'email':
					var theMsg = 'Ticket has been emailed to customer!';
					break;
				default:
					if(parseInt(msg)!=1){
						var theMsg = msg + ' tickets have been checked in.';	
					} else {
						var theMsg = '1 ticket has been checked in.';	
					}
					break;
			}
		
			$('#ticketholderDetailsContent').prepend('<div class="ui-body ui-body-e ticketholderDetailsMessage" id="ticketholderDetailsMessage"><p>'+theMsg+'</p></div>');
			window.setTimeout(function(){
				$('#ticketholderDetailsMessage').fadeOut(500,function(){
					$(this).remove();
				});
			},5000);
		}
		$.mobile.hidePageLoadingMsg();
	});

}

var openEmailTicketForm = function(ticketID) {
	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=ticketholderDetails&emailFields=true&ticketID='+ticketID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#ticketholderDetailsContent').html(data.HTML).trigger('create');
		}
		$.mobile.hidePageLoadingMsg();
	});
}

var emailTickets = function(ticketID) {
	$.mobile.showPageLoadingMsg();
	var specificEmail = $('#specificEmail').val();
	var attachTickets = $('#attachTickets').val();
	
	if($('#sendSpecificEmailNo').is(':checked')) {
		specificEmail = '';
	}
	
	var surl = 'http://www.'+$.boxofficeUser.brandPropertySite+'/ipadbo/servicesBrandSpecific.cfc?method=emailTicketHolder&ticketID='+ticketID+'&specificEmail='+specificEmail+'&attachTickets='+attachTickets+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			openTicketHolderInfo(ticketID,'email',false);
		}
		$.mobile.hidePageLoadingMsg();
	});
}

var checkinTicketHolder = function() {
	var ticketID = $('#ticketID').val();
	var qty = $('#ticketCheckinQty').val();
	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=checkinTickets&ticketID='+ticketID+'&qty='+qty+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			openTicketHolderInfo(ticketID,data.TOTALQTY,false);
		}
		$.mobile.hidePageLoadingMsg();
	});
}










var showInfo = function(showTimingID) {
	
	//$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=showinfo&showTimingID='+showTimingID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			showAlert('Show/Event Information',data.HTML);
			//$.mobile.hidePageLoadingMsg();
		}
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
	clearTicketHolders();
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
var clearTicketHolders = function() {
	$('#ticketholdersPrev').attr('onclick','return false;').show();
	$('#ticketholdersNext').attr('onclick','return false;').show();
	$('#ticketholdersHeader').html('Ticket Holders &amp; Guest List');
	$('#ticketholdersPageContent').html('');
}





var togglePaymentType = function(type) {
	
	$('#cashFields').hide();
	$('#creditcardFields').hide();
	$('#giftcardFields').hide();
	$('#'+type+'Fields').show();
	
	switch(type) {
		case 'cash':
			$('#paymentTypeID').val(2);
			break;	
		case 'creditcard':
			$('#paymentTypeID').val(1);
			break;	
		case 'giftcard':
			$('#paymentTypeID').val(3);
			break;	
	}

}



var changeQty = function(amount,qtyID) {
	var qtyField = $('#qty'+qtyID);
	var newQty = eval(parseInt($(qtyField).val())+amount);
	if(newQty < 0) {
		$(qtyField).val(0);	
	} else {
		$(qtyField).val(newQty);
	}
	updateShoppingCart();
}

var clearCashReceived = function() {
	$('#cashReceived').val('0.00');
	calculateChange();
}

var checkCashRecieved = function() {
	if(isNaN($('#cashReceived').val())) {
		$('#cashReceived').val('0.00');
		calculateChange();
	} else {
		$('#cashReceived').val(parseFloat($('#cashReceived').val()).toFixed(2))
	}
}

var changeCashReceived = function(amount) {
	var newVal = eval(parseFloat($('#cashReceived').val())+amount);
	if (newVal<0) {
		$('#cashReceived').val('0.00');
	} else {
		$('#cashReceived').val(parseFloat(newVal).toFixed(2));
	}
	
	// calculate change
	calculateChange();
}

var calculateChange = function() {
	var totalAmount = parseFloat($('#checkoutTotal').val());
	var cashRecieved = parseFloat($('#cashReceived').val());
	var changeAmount = eval(cashRecieved-totalAmount);
	
	if(changeAmount > 0) {
		$('#cashChange').html('$'+parseFloat(changeAmount).toFixed(2));
		$('#changeTotal').val(parseFloat(changeAmount).toFixed(2));
	} else {
		$('#cashChange').html('$0.00');
		$('#changeTotal').val('0.00');
	}
	
}


var updateShoppingCart = function() {
	var showTimingID = $('#showTimingID').val();	
	var qty = 0;	
	var showTierList = '';	
	var couponID = 0;
	var paymentTypeID = $('#paymentTypeID').val();
	var ticketSaleTypeID = $('#ticketSaleTypeID').val();
	var isVipGuestlistCoupon = false;
	
	$('input','#ticketContainer>ul.ticketQtyList').each(function(i){
		var showTierID = parseInt($(this).attr('id').replace('qty',''));
		var thisQty = parseInt($(this).val());
		qty = eval(qty+thisQty);
		if(showTierID > 0) {
			if(showTierList.length) {
				showTierList = showTierList + ';';	
			}
			showTierList = showTierList + showTierID + ':' + thisQty;
		}
	});
	
	if(showTierList.length) {
		showTierList = showTimingID + '|' + showTierList;
		$('#showTierList').val(showTierList);
	} else {
		showTierList = "0|0:0";
	}
	
	if($('#appliedCouponID').val() > 0) {
		couponID = $('#appliedCouponID').val();
	} else {
		couponID = $('#discountID').val();
	}
	
	if(couponID=='VIP' || couponID=='GuestList') {
		isVipGuestlistCoupon = true;
		couponID=0;
	}
	
	$.mobile.showPageLoadingMsg();
	var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=updateticketprice&venueID='+$.boxofficeUser.venueID+'&showTimingID='+showTimingID+'&qty='+qty+'&showTierList='+showTierList+'&couponID='+couponID+'&isVipGuestlistCoupon='+isVipGuestlistCoupon+'&paymentTypeID='+paymentTypeID+'&ticketSaleTypeID='+ticketSaleTypeID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
	$.getJSON(surl, function(data) {
		if(data.SUCCESS) {
			$('#orderTotalContainer').html(data.CARTDISPLAY).trigger('create');
			$('#cashTotal, #creditcardTotal, #giftcardTotal').html(data.TOTALFORMATTED);
            $('#checkoutTotal').val(data.TOTAL);
			calculateChange();
			$.mobile.hidePageLoadingMsg();
		}
	});
	
}


var applyCouponCode = function () {
	
	// Look up the coupon code
	
	if($('#couponCode').val().length) {
			
		var showTimingID = $('#showTimingID').val();	
		var showTierList = '';	
		var ticketSaleTypeID = $('#ticketSaleTypeID').val();
		
		$('input','#ticketContainer>ul.ticketQtyList').each(function(i){
			var showTierID = parseInt($(this).attr('id').replace('qty',''));
			if(showTierID > 0) {
				if(showTierList.length) {
					showTierList = showTierList + ';';	
				}
				showTierList = showTierList + showTierID + ':' + parseInt($(this).val());
			}
		});
		
		if(showTierList.length) {
			showTierList = showTimingID + '|' + showTierList;
			$('#showTierList').val(showTierList);
		} else {
			showTierList = "0|0:0";
		}
			
		$.mobile.showPageLoadingMsg();
		var surl = 'http://www.ticketmob.com/ipadbo/services.cfc?method=validateCoupon&showTimingID='+showTimingID+'&couponCode='+$('#couponCode').val()+'&showTierList='+showTierList+'&ticketSaleTypeID='+ticketSaleTypeID+'&datasource='+$.boxofficeUser.datasource+'&callback=?';
		$.getJSON(surl, function(data) {
			if(data.SUCCESS) {
				$('#couponCode').val('');
				$.mobile.hidePageLoadingMsg();
				if(data.VALID) {
					$('#appliedCouponID').val(data.COUPONID);
					$('#couponCodeContainer').append('<a href="" onclick="removeCoupon();return false;" data-role="button" data-mini="true" data-icon="delete" data-theme="b">Remove Coupon</a>').trigger('create');
					$('label,input,div','#couponCodeContainer').hide();
					updateShoppingCart();
				} else {
					showAlert('Invalid Coupon Code','Sorry the coupon code provided was not valid. Please try again.');
				}
			} else {
				$.mobile.hidePageLoadingMsg();	
			}
		});
	
	}
	
}

var removeCoupon = function() {
	$('a','#couponCodeContainer').remove();
	$('#appliedCouponID').val(0);
	$('label,input,div','#couponCodeContainer').show();
	updateShoppingCart();
}





var submitCheckout = function() {

	
	//validate 
	var errorMsg = "";
	var checkNameFields = false;
	
	// Check quantity
	var totalQty = 0;
	$('input','#ticketContainer>ul.ticketQtyList').each(function(i){
		totalQty = eval(totalQty+parseInt($(this).val()));
	});
	if(totalQty==0) {
		errorMsg = errorMsg + "Please select a valid quantity of tickets<br />"	
	}
	
	switch(parseInt($('#paymentTypeID').val())) {
		case 1:
			// Credit Card
			if (!_CF_checkcreditcard($('#cardNumber').val(), true)) {
				errorMsg = errorMsg + "Please enter a valid credit card number<br />";
			}
			// Card Expiration
			if($('#cardExpiration').val().length==0) {
				errorMsg = errorMsg + "Please enter a credit card expiration<br />";
			}
			// Card CVV
			if (!_CF_checkinteger($('#cardCVV').val(), true)) {
				errorMsg = errorMsg + "Please enter a valid credit card CVV code<br />";
			}
			// Billing Zip
			if (!_CF_checkzip($('#cardZipCode').val(), true)) {
				errorMsg = errorMsg + "Please enter a valid billing zip code<br />";
			}
			// First and Last
			checkNameFields = true;
			
			break;
		/*
		case 2:
			// Cash
			if(parseFloat($('#cashReceived').val())<parseFloat($('#checkoutTotal').val())) {
				errorMsg = errorMsg + "Please enter an amount of cash recieved equal to or greater than the total<br />"	
			}
			break;
		*/
		case 3:
			// Gift Card
			if (!_CF_checkinteger($('#giftcardNumber').val(), true)) {
				errorMsg = errorMsg + "Please enter a valid gift card number<br />"	
			}

			break;
	}

	if($('#ticketSaleTypeID').val()==3) {
		// Phone Order
		checkNameFields = true;
		
		if (!_CF_checkEmail($('#customerEmailAddress').val(), true)) {
			errorMsg = errorMsg + "Please enter a valid customer email address<br />"	
        }
		
	}

	if(checkNameFields) {
		
		if($('#customerFirstName').val().length==0) {
			errorMsg = errorMsg + "Please enter the customer first name<br />"	
        }
		if($('#customerLastName').val().length==0) {
			errorMsg = errorMsg + "Please enter the customer last name<br />"	
        }
		
	}
	
	// Make sure phone is valid if entered
	if (!_CF_checkphone($('#customerPhoneNumber').val(), false)) {
		errorMsg = errorMsg + "Please enter a valid customer phone number<br />"	
	}
	
	if(errorMsg.length) {
		
		showAlert('Error Completing Purchase',errorMsg);
		
	} else {
		
		//Submit the form
		$.mobile.showPageLoadingMsg();

		var queryString = 'method=buyticket';
			queryString = queryString + '&datasource='+$.boxofficeUser.datasource;
			queryString = queryString + '&showTimingID='+$('#showTimingID').val();
			queryString = queryString + '&qty='+totalQty;
			queryString = queryString + '&showTierList='+$('#showTierList').val();
			queryString = queryString + '&paymentTypeID='+$('#paymentTypeID').val();
			queryString = queryString + '&ticketSaleTypeID='+$('#ticketSaleTypeID').val();
			queryString = queryString + '&cardNumber='+$('#cardNumber').val();
			queryString = queryString + '&cardExpiration='+$('#cardExpiration').val();
			queryString = queryString + '&cardCVV='+$('#cardCVV').val();
			queryString = queryString + '&cardZipCode='+$('#cardZipCode').val();
			queryString = queryString + '&giftcardNumber='+$('#giftcardNumber').val();
			queryString = queryString + '&cashReceived='+$('#cashReceived').val();
			queryString = queryString + '&checkoutTotal='+$('#checkoutTotal').val();
			queryString = queryString + '&customerFirstName='+$('#customerFirstName').val();
			queryString = queryString + '&customerLastName='+$('#customerLastName').val();
			queryString = queryString + '&customerEmailAddress='+$('#customerEmailAddress').val();
			queryString = queryString + '&customerPhoneNumber='+$('#customerPhoneNumber').val();
			queryString = queryString + '&couponID='+$('#discountID').val();
			queryString = queryString + '&appliedCouponID='+$('#appliedCouponID').val();
			queryString = queryString + '&couponCode='+$('#couponCode').val();
			queryString = queryString + '&userID='+$.boxofficeUser.userID;
			queryString = queryString + '&callback=?';

		var surl = 'https://www.'+$.boxofficeUser.brandPropertySite+'/ipadbo/servicesBrandSpecific.cfc?'+queryString;
		$.getJSON(surl, function(data) {
			if(data.SUCCESS) {
				if(data.ERROR==0) {
					//console.log(data);
					navigateSellTicket(data.SHOWTIMINGID,0,0,false,false);
					openTicketHolderInfo(data.TICKETID,'',$.boxofficeSettings.defaultCheckIn);
				} else {
					showAlert('Error','An error occured completing the order.<br /><br />'+data.ERRORMSG);	
				}
			}
			$.mobile.hidePageLoadingMsg();
		});
			
	}
	
}




























