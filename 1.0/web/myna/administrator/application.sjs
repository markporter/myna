Myna.applyTo(this);

$application.appName = "myna_admin";
$application.prettyName = "Myna Adminstrator";
$application.noAuthFuses=["login","auth", "logout"];
$application.defaultFuseAction="login";
$application.mainFuseAction="main";
//this is moved to the parent folder's application.sjs
//$application.extUrl =$server.rootUrl +"shared/js/ext_latest/"




//append request start function
$application.appendFunction("onRequestStart",function(){
	var session_cookie;		// stores encrypted session data
	
	if (!$req.data.fuseaction) $req.data.fuseaction=this.defaultFuseAction; 
	//is the user authenticated?
	if (this.noAuthFuses.indexOf($req.data.fuseaction.toLowerCase()) != -1) return;	
	if ( !$cookie.getAuthUserId() ){
			/* 	if the fuseaction requires authentication, 
				but the user is not authenticated, then set
				the fuseaction to the default (login)
			*/
			$req.data.fuseaction=this.defaultFuseAction;
		
	} else { //is the the user authorized for this fuseaction?
		if ($cookie.getAuthUserId() == "myna_admin") return;
		
		var user = $cookie.getAuthUser();
		if (user.hasRight("myna_admin","full_admin_access")) return;
		
		$req.data.fuseaction="no_access";
		throw new Error("You do not have access to that feature")
		
	}
	
	
	
});

/* onApplicationStart */
$application.onApplicationStart=function(){
	var props =new File("/WEB-INF/classes/cron.properties") 
	if (!props.exists()){
		props.writeString("")
	}
}

var sessionSecret = "JZjpakgm1lCYI1x7MHZPGATcH3A06ONM";
/* Load datasource driver properties */
if (!$application.get("db_properties")){
	var propFiles = new File("/shared/js/libOO/db_properties").listFiles("sjs");
	var props={}
	
	propFiles.forEach(function(propFile){
		if (!/[\w]+.sjs$/.test(propFile.getFileName())) return;
		var vendor = propFile.getFileName().split(/\./)[0];
		var obj={};
		include(propFile,obj);
		if (obj.dsInfo){
			props[vendor] = obj.dsInfo;
		}
	});
	$application.set("db_properties",props);
}