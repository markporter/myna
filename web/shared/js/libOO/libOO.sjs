Object.defineProperty(this,"$server_gateway",{
	get:function () {
		return $server_global.getCurrentThread()
	}
});

(function (scope) {
	[
		"$req",
		"$res",
		"$application",
		"$session",
		"$server",
		"$cookie,",
		"$profiler"
	].forEach(function (topVar) {
		Object.defineProperty(scope,topVar,{
			get:function () {
				if (!$server_global.getCurrentThread().threadScope[topVar]){
					java.lang.System.err.println("-------------------------------------------------------------------------------");
					java.lang.System.err.println("looking for " + topVar + " returning " + $server_global.getCurrentThread().threadScope[topVar])		
					java.lang.System.err.println("curr thread = " + Object.keys($server_global.getCurrentThread().threadScope))

					java.lang.Thread.sleep(1000)
				}
				return $server_global.getCurrentThread().threadScope[topVar]
			}
		});
	})	
})(this);

/*Object.defineProperty(this,"$req",{
	get:function () {

		return $server_global.getCurrentThread().threadScope.$req
	}
});

Object.defineProperty(this,"$res",{
	get:function () {

		return $server_global.getCurrentThread().threadScope.$req
	}
});

Object.defineProperty(this,"$server",{
	get:function () {
		return $server_global.getCurrentThread().threadScope.$server
	}
});

Object.defineProperty(this,"$profiler",{
	get:function () {
		return $server_global.getCurrentThread().threadScope.$profiler
	}
});
*/
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
	"DataSet.js",
	"DataSet.sjs",
	"Cache.sjs",
	"JavaUtils.sjs",
	"Profiler.js",
	"Query.sjs",
	"File.sjs",
	//"CommonJS.sjs",
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
	//"WebService.sjs",
	"Permissions.sjs",
	//"Event.sjs",
	//"Cluster.sjs",
	"Swing.sjs",
	"Inflector.js",
	"Admin.sjs",
	"Shell.sjs",	
	//"standard_objects/server.sjs"
	
	
].forEach(function(element){

	//try {
		var path = $server_global.getCurrentThread().getNormalizedPath(element);
		java.lang.System.out.println("loading library " + path)
		$server_global.getCurrentThread().includeOnce(path);
	/*} catch(e){
		java.lang.System.err.println("libOO.sjs Error: " +e)
		$server_gateway.log("ERROR",String(e).left(100),Myna?Myna.formatError(e):String(e))
	}*/
});

