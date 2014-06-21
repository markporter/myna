var $server_global = Packages.info.emptybrain.myna.MynaThread;
var $server_gateway = $server_global.getCurrentThread();
java.lang.System.err.println("server global = " + $server_global);
java.lang.System.err.println("server gateway = " + $server_gateway);
//$server_global.getCurrentThread().include("/shared/js/libOO/Myna.sjs");
[
	"Number.js",
	"Array.js",
	"ObjectLib.js",
	"Object.js",
	"String.js",
	"Date.js",
	"Function.js",
	
	
].forEach(function(element){

		var path = $server_global.getCurrentThread().getNormalizedPath(element);
		java.lang.System.out.println("loading library " + path)
		$server_global.getCurrentThread().includeOnce(path)
	
});

Myna.includeOnce("/shared/js/libOO/standard_objects/profiler.sjs");
Myna.includeOnce("/shared/js/libOO/standard_objects/server.sjs");java.lang.System.err.println("server = " + $server);
Myna.includeOnce("/shared/js/libOO/standard_objects/req.sjs");
Myna.includeOnce("/shared/js/libOO/standard_objects/cookie.sjs");
Myna.includeOnce("/shared/js/libOO/standard_objects/session.sjs");java.lang.System.err.println("session = " + $session);
Myna.includeOnce("/shared/js/libOO/standard_objects/res.sjs");
Myna.includeOnce("/shared/js/libOO/standard_objects/app.sjs");

$session.init();
//calculate path
/* var path = $server.requestDir;
if ($server.requestScriptName == "__ERROR_404__.sjs" && $server.request){
	path =String($server.request.attributes.get('javax.servlet.forward.servlet_path')).listBefore("/")
	path = new Myna.File(path).toString(); 
}  */

