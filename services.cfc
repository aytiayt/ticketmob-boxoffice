<cfcomponent output="false">
 
 
	<cffunction name="userinfo" access="remote" returnType="any" returnFormat="plain" output="false">
		<cfargument name="userID" type="numeric" required="true" />
		<cfargument name="brandProperty" type="string" required="true" />
        <cfargument name="callback" type="string" required="false" />

    	<!--- set up the struct of data to return --->
        <cfscript>
            LOCAL.result = structNew();
            LOCAL.result.success = false;
            LOCAL.result.userID = ARGUMENTS.userID;
            LOCAL.result.userType = 0;
            LOCAL.result.firstName = '';
            LOCAL.result.lastName = '';
            LOCAL.result.emailAddress = '';
            LOCAL.result.venueID = 0;
            LOCAL.result.venueName = '';
            LOCAL.result.brandProperty = ARGUMENTS.brandProperty;
            LOCAL.result.datasource = '';
        </cfscript>
        
        <cftry>

			<cfswitch expression="#ARGUMENTS.brandProperty#">
				<cfcase value="LS">
                	<cfset LOCAL.datasource = "LaughStub" />
                </cfcase>
				<cfcase value="TS">
                	<cfset LOCAL.datasource = "TuneStub" />
                </cfcase>
				<cfcase value="ES">
                	<cfset LOCAL.datasource = "ElectroStub" />
                </cfcase>
				<cfcase value="TM">
                	<cfset LOCAL.datasource = "TicketMob" />
                </cfcase>
                <cfdefaultcase>
                	<cfset LOCAL.datasource = "" />
                </cfdefaultcase>            
            </cfswitch>
            
            <cfif len(trim(LOCAL.datasource))>
            
            	<cfquery name="getUserDetails" datasource="#LOCAL.datasource#">
                	SELECT userID, userType, email, firstName, lastName
                    FROM tblUser
                    WHERE userID = <cfqueryparam value="#ARGUMENTS.userID#" cfsqltype="CF_SQL_INTEGER">
                </cfquery>
                
                <cfif getUserDetails.recordcount eq 1>
                
					<cfscript>
						LOCAL.result.success = true;
						LOCAL.result.userID = getUserDetails.userID;
						LOCAL.result.userType = getUserDetails.userType;
						LOCAL.result.firstName = getUserDetails.firstName;
						LOCAL.result.lastName = getUserDetails.lastName;
						LOCAL.result.emailAddress = getUserDetails.email;
			            LOCAL.result.datasource = LOCAL.datasource;
                    </cfscript>
                    
                    <cfswitch expression="#getUserDetails.userType#">
                    
                    	<cfcase value="3">
                       		
                        </cfcase>

                    	<cfcase value="6">
                        
                        </cfcase>
                        
                        <cfcase value="7">
                        
                        </cfcase>
                    
                    </cfswitch>                   
                
                </cfif>
            
            </cfif>
        
        	<cfcatch type="any">
            	<!--- The code did no work --->
				<cfmail to="jonah@ticketmob.com" from="info@ticketmob.com" subject="Error in iPad Box Office method userinfo" type="html">
                	<cfdump var="#cfcatch#">
                </cfmail>
            </cfcatch>
            
        </cftry>
        
        
        <!--- serialize and wrap the result --->
        <cfset LOCAL.result = ARGUMENTS.callback & "(" & serializeJSON(LOCAL.result) & ")" />
        
        <!--- return the struct --->
		<cfreturn LOCAL.result />
        
    </cffunction>



    
    <cffunction name="userlogin" access="remote" returnType="any" returnFormat="plain" output="false">
		<cfargument name="username" type="string" required="true" />
		<cfargument name="password" type="string" required="true" />
		<cfargument name="brandProperty" type="string" required="true" />
        <cfargument name="callback" type="string" required="false" />

    	<!--- set up the struct of data to return --->
        <cfscript>
            LOCAL.result = structNew();
            LOCAL.result.success = false;
            LOCAL.result.userID = 0;
            LOCAL.result.userType = 0;
            LOCAL.result.firstName = '';
            LOCAL.result.lastName = '';
            LOCAL.result.emailAddress = '';
            LOCAL.result.venueID = 0;
            LOCAL.result.venueName = '';
            LOCAL.result.brandProperty = ARGUMENTS.brandProperty;
            LOCAL.result.datasource = '';
        </cfscript>
        
        <cftry>

			<cfswitch expression="#ARGUMENTS.brandProperty#">
				<cfcase value="LS">
                	<cfset LOCAL.datasource = "LaughStub" />
                </cfcase>
				<cfcase value="TS">
                	<cfset LOCAL.datasource = "TuneStub" />
                </cfcase>
				<cfcase value="ES">
                	<cfset LOCAL.datasource = "ElectroStub" />
                </cfcase>
				<cfcase value="TM">
                	<cfset LOCAL.datasource = "TicketMob" />
                </cfcase>
                <cfdefaultcase>
                	<cfset LOCAL.datasource = "" />
                </cfdefaultcase>            
            </cfswitch>
            
            <cfif len(trim(LOCAL.datasource))>
            
            	<cfquery name="checkLogin" datasource="#LOCAL.datasource#">
                	SELECT userID, userType, email, firstName, lastName
                    FROM tblUser
                    WHERE email = <cfqueryparam value="#ARGUMENTS.username#" cfsqltype="CF_SQL_VARCHAR" maxlength="100">
                    AND password = <cfqueryparam value="#ARGUMENTS.password#" cfsqltype="CF_SQL_VARCHAR" maxlength="100">
                </cfquery>
                
                <cfif checkLogin.recordcount eq 1 AND listFindNoCase("3,6,7",checkLogin.userType)>
                
					<cfscript>
						LOCAL.result.success = true;
						LOCAL.result.userID = checkLogin.userID;
						LOCAL.result.userType = checkLogin.userType;
						LOCAL.result.firstName = checkLogin.firstName;
						LOCAL.result.lastName = checkLogin.lastName;
						LOCAL.result.emailAddress = checkLogin.email;
			            LOCAL.result.datasource = LOCAL.datasource;
                    </cfscript>
                
                </cfif>
            
            </cfif>
        
        	<cfcatch type="any">
            	<!--- The code did no work --->
				<cfmail to="jonah@ticketmob.com" from="info@ticketmob.com" subject="Error in iPad Box Office method userinfo" type="html">
                	<cfdump var="#cfcatch#">
                </cfmail>
            </cfcatch>
            
        </cftry>
        
        
        <!--- serialize and wrap the result --->
        <cfset LOCAL.result = ARGUMENTS.callback & "(" & serializeJSON(LOCAL.result) & ")" />
        
        <!--- return the struct --->
		<cfreturn LOCAL.result />
        
    </cffunction>

    
    
</cfcomponent>
