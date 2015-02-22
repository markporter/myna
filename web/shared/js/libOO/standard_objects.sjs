//Myna.includeOnce("standard_objects/profiler.sjs");
//Myna.includeOnce("standard_objects/server.sjs");
//Myna.includeOnce("standard_objects/req.sjs");
//Myna.includeOnce("standard_objects/cookie.sjs");
//Myna.includeOnce("standard_objects/session.sjs");
//Myna.includeOnce("standard_objects/res.sjs");
//Myna.includeOnce("standard_objects/app.sjs");


$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardProfiler(),this);
$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardServer(),this);
$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardReq(),this);
$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardCookie(),this);
$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardSession(),this);
$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardRes(),this);
$server_gateway.importPreCompiled(new Packages.info.emptybrain.myna.libcache.StandardApp(),this);

$session.init();
//calculate path
/* var path = $server.requestDir;
if ($server.requestScriptName == "__ERROR_404__.sjs" && $server.request){
	path =String($server.request.attributes.get('javax.servlet.forward.servlet_path')).listBefore("/")
	path = new Myna.File(path).toString(); 
}  */

