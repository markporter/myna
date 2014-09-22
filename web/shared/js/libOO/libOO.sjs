[
	"Number.js",
	"Array.js",
	"ObjectLib.js",
	"Object.js",
	"String.js",
	"Date.js",
	"Function.js",
	"Template.sjs",
	"Myna.sjs",
	"KeyStore.sjs",
	//"DataSet.js",
	"DataSet.sjs",
	"Cache.sjs",
	"JavaUtils.sjs",
	"Profiler.js",
	"Query.sjs",
	"File.sjs",
	"CommonJS.sjs",
	"Ldap.sjs",
	"ValidationResult.js",
	"Validation.js",
	"DataManager.sjs",
	"Database.sjs",
	"Table.sjs",
	"Thread.sjs",
	"ThreadPool.sjs",
	"Mail.sjs",
	"HttpConnection.sjs",
	"WebService.sjs",
	"Permissions.sjs",
	"Event.sjs",
	//"Cluster.sjs",
	"Swing.sjs",
	"Inflector.js",
	"Admin.sjs",
	"Shell.sjs"
	
	
].forEach(function(element){
	var compiled=true
	var time = new Date().getTime();
	var className = element.split(/\./)[0]
	//try {
		if (compiled){
		var O = Packages.info.emptybrain.myna.libcache[className]
		var scope ={}
		$server_gateway.importPreCompiled(new O(),this)
	} else {
	
		
		var path = $server_gateway.getNormalizedPath(element);
	
		$server_gateway.includeOnce(path);
		//java.lang.System.err.println(className + ": " +(new Date().getTime() - time))
	}
	/*} catch(e){
		java.lang.System.err.println("libOO.sjs Error: " +e)
		$server_gateway.log("ERROR",String(e).left(100),Myna?Myna.formatError(e):String(e))
	}*/
});

