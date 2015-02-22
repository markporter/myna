
//load files
var libs=[
	"/shared/js/libOO/Number.js",
	"/shared/js/libOO/Array.js",
	"/shared/js/libOO/ObjectLib.js",
	"/shared/js/libOO/Object.js",
	"/shared/js/libOO/String.js",
	"/shared/js/libOO/Date.js",
	"/shared/js/libOO/Function.js",
	"/shared/js/libOO/Template.sjs",
	"/shared/js/libOO/Myna.sjs",
	"/shared/js/libOO/KeyStore.sjs",
	"/shared/js/libOO/DataSet.sjs",
	"/shared/js/libOO/Cache.sjs",
	"/shared/js/libOO/JavaUtils.sjs",
	"/shared/js/libOO/Profiler.js",
	"/shared/js/libOO/Query.sjs",
	"/shared/js/libOO/File.sjs",
	"/shared/js/libOO/CommonJS.sjs",
	"/shared/js/libOO/Ldap.sjs",
	"/shared/js/libOO/ValidationResult.js",
	"/shared/js/libOO/Validation.js",
	"/shared/js/libOO/DataManager.sjs",
	"/shared/js/libOO/Database.sjs",
	"/shared/js/libOO/Table.sjs",
	"/shared/js/libOO/Thread.sjs",
	"/shared/js/libOO/ThreadPool.sjs",
	"/shared/js/libOO/Mail.sjs",
	"/shared/js/libOO/HttpConnection.sjs",
	"/shared/js/libOO/WebService.sjs",
	"/shared/js/libOO/Permissions.sjs",
	"/shared/js/libOO/Event.sjs",
	"/shared/js/libOO/Swing.sjs",
	"/shared/js/libOO/Inflector.js",
	"/shared/js/libOO/Admin.sjs",
	"/shared/js/libOO/Shell.sjs",
	"/shared/js/libOO/server_start.sjs",
	"/shared/js/libOO/request_handler.sjs",
	"/shared/js/libOO/standard_objects/app.sjs|StandardApp",
	"/shared/js/libOO/standard_objects/cookie.sjs|StandardCookie",
	"/shared/js/libOO/standard_objects/profiler.sjs|StandardProfiler",
	"/shared/js/libOO/standard_objects/req.sjs|StandardReq",
	"/shared/js/libOO/standard_objects/res.sjs|StandardRes",
	"/shared/js/libOO/standard_objects/server.sjs|StandardServer",
	"/shared/js/libOO/standard_objects/session.sjs|StandardSession",
]

var runtimeLibs=[
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
]
String.prototype.titleCap=function(){
	return this.split(/ /).map(function(text){
		if (text.length){
			text=text.substr(0,1).toUpperCase() + text.substr(1).toLowerCase();
		}
		return text;
	}).join(" ");
};
if ($server_gateway.isInitThread && !$server_gateway.environment.containsKey("isCommandline")){
//if ($server_gateway.isInitThread){
	
	//set up compiler
		var ClassCompiler =org.mozilla.javascript.optimizer.ClassCompiler;
		var CompilerEnvirons =org.mozilla.javascript.CompilerEnvirons;
		var SourceReader=org.mozilla.javascript.tools.SourceReader;
		var ToolErrorReporter =org.mozilla.javascript.tools.ToolErrorReporter;
		var reporter = new ToolErrorReporter(true);
		var compilerEnv = new CompilerEnvirons();
		compilerEnv.setErrorReporter(reporter);
		compilerEnv.setOptimizationLevel(9);

		var compiler = new ClassCompiler(compilerEnv);
	// compile function
		function compile(path,element) {
			var elementParts = element.split("|")
			element = elementParts[0]
			var className = elementParts[1]||element.split(/\./)[0].titleCap()
			var FileUtils = Packages.org.apache.commons.io.FileUtils;
			var sourceLocation = $server_gateway.getNormalizedFile(path +"/"+element)
			
			
			var source = $server_gateway.translateString(
				String(FileUtils.readFileToString(sourceLocation)),
				sourceLocation.toURI().toString()
			);
			var targetDir = $server_gateway.getNormalizedPath("/WEB-INF/classes/info/emptybrain/myna/libcache");
			//targetDir.createDirectory();

			var compiled = compiler.compileToClassFiles(source, sourceLocation.toURI().toString(), 1, "info.emptybrain.myna.libcache." + className);
			compiled.reduce(function (className,node,count) {
				if (count % 2 == 0) {
					return String(node).split(/\./).pop()
				} else {
					java.lang.System.out.println("Pre-compiling " + className +"...")
					var targetFile = $server_gateway.getNormalizedFile(targetDir +"/" + className + ".class");
					FileUtils.writeByteArrayToFile(
						targetFile,
						node
					);
					// Myna.printConsole("writing {0}".format(className));
					// new Myna.File(targetDir,className+".class").writeBinary(node)
				}
			},null)
		}
		libs.forEach(function (element) {
			var parts = element.split(/\//)
			element = parts.pop()

			compile(parts.join("/"),element)
		})
		
}

runtimeLibs.forEach(function(element){
	var compiled=true
	var time = new Date().getTime();
	var className = element.split(/\./)[0].titleCap()

	//try {
	if (compiled){
		var O = Packages.info.emptybrain.myna.libcache[className]
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

