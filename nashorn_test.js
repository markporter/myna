java.lang.System.out.println("success!");
java.lang.System.out.println($server_gateway);


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
	
	
].every(function(element){
	var source = $server_gateway.getNormalizedPath("/shared/js/libOO/" +element)
	print(source)
	load(source)

	return true
});


