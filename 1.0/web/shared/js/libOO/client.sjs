[
	"Number.js",
	"Array.js",
	"ObjectLib.js",
	"String.js",
	"Function.js",
	"Date.js",
	"ValidationResult.js",
	"Validation.js",
	"Profiler.js",
	"DataSet.js",
	"debug_window.js",
	"Inflector.js",
	"Async.js",
].forEach(function(element){
	$res.print(new Myna.File(element).readString()+"\n");
});
