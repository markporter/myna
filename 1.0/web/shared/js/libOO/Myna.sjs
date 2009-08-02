/* Class: Myna
	Top Level library package (server-only).
	
	Detail:
		Contains generally useful functions that don't fit into the other 
		categories. The Myna namespace is also contains several other objects and 
		libraries  
		
		See:
		
		<Myna.Database>, <Myna.DataManager>, <Myna.File>, <Myna.HttpConnection>,
		<Myna.JavaUtils>, <Myna.Ldap>, <Myna.Mail>, <Myna.Permissions>, 
		<Myna.Profiler>, <Myna.Query>, <Myna.Table>, <Myna.Template>,
		<Myna.Thread>, <Myna.ValidationResult>, <Myna.WebService>,
 */
 
if (!Myna) var Myna={}
/* Function: abort 
	Halts JavaScript execution, optionally showing a message or dumping an object   
	 
	Parameters: 
		label	- 	*Optional* If supplied by itself, this is simply out put to the browser. 
					If value is supplied as well, this because the title for the dump.  
		value   - 	*Optional* Value to dump  
 
	Returns: 
		void
		
	See: 
		<Myna.dump>
	*/
	Myna.abort=function Myna_abort(label,value){
		if (value != undefined){
			$res.print(Myna.dump(value,label));
		} else if (label != undefined){
			$res.print("<hr>" +label);
		}
		throw ("___MYNA_ABORT___");
	}
	
/* Function: beanToObject 
	Attempts to convert a JavaBean in to JavaScript object 
	 
	Parameters: 
		bean - Java object to convert  
 
	Returns: 
		JavaScript Object 
		
	Detail: 
		This function examines _bean_ and looks for functions that start with "get" 
		followed by at least one other character. These functions are executed and 
		their values are returned as a Javascript object where the property names 
		are the get functions minus the "get" and the following character lower cased. 
		Functions that start with "is" are treated similarly, except the "is" is kept 
		in the proerty name
		
		(code)
		*EXAMPLE*
		
		this class...
		
		public class PersonBean implements java.io.Serializable {
			private name="bob";
			private deceased=true;
			...
			public String getName() {
				return this.name;
			}
			
			public boolean isDeceased() {
				return this.deceased;
			}
		}
		
		would become...
		
		{
			name:"bob",
			isDeceased:true
		}
		(end)
	 
	*/
	Myna.beanToObject=function Myna_beanToObject(bean){
		var 
			result={}, // object with get properties
			property,	// 
			x;		// loop counter
			
		for (x in bean){
			if (/^get./.test(x)){
				try{ 
					property=x.replace(/^get/,"");
					property=property.substr(0,1).toLowerCase() + property.substr(1);
					result[property] = bean[x]();
					if (result[property] instanceof java.lang.String){
						result[property] = result[property];
					}
					
				}catch(e){} 
			}
			if (/^is./.test(x)){
				try{ 
					property=x.replace(/^is/,"");
					property=property.substr(0,1).toLowerCase() + property.substr(1);
					result[property] = bean[x]();
					if (result[property] instanceof java.lang.String){
						result[property] = Boolean(result[property]);
					}
					
				}catch(e){} 
			}
		}
		return result;
	}
/* Function: createSyncFunction 
	returns a thread-safe version of a javascript function  
	 
	Parameters: 
		functionObject - JavaScript Function object to synchronize 
 
	Returns: 
		a thread-safe version _functionObject_, similar to synchronized 
		keyword for Java functions
	 
	 
	*/
	Myna.createSyncFunction=function Myna_createSyncFunction(functionObject){	
		return new Packages.org.mozilla.javascript.Synchronizer(functionObject)
	}
/* Function: createUuid 
	Creates a Universally Unique Identifier 
	 
	Returns: 
		String UUID
		
	Detail: 
		A UUID is a 128 bit number represented as a HEX string that is 
		expected to unique even when compared to numbers generated by 
		other generators. Here is an example: 
		
		> f005889f-2b8d-409c-a126-f01eb50846d4
		
		Good uses for UUIDs are anything that needs to be uniquely 
		identified such as :
		
		* Primary key for a table (especially when you don't have 
			access to the database at time of generation)
		* Session id
		* Cryptographic salt (this is slow)
		* Temporary File names in a cluster (Two JVM's may create the same temp 
			file in the save directory using <$lib.file.createTempFile>)
		
		Myna UUID's are based on a cryptographically secure random number 
		generator, and are therefore NOT sortable by time. 
		
		See:
			http://jug.safehaus.org/
	 
	 
	*/
	Myna.createUuid=function Myna_createUuid(){
		var gen = Packages.org.safehaus.uuid.UUIDGenerator.getInstance();
		return String(gen.generateRandomBasedUUID());
	}
/* Function: createByteArray 
	returns a java Byte array of the supplied size 
	 
	
		
	Detail: 
		When working with binary data or streams it is often necessary to pass 
		a Byte array to java functions as a buffer. This function will create 
		this buffer for you 
	*/
	Myna.createByteArray=function Myna_createByteArray(size){
		return new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,size);	
	}
/* Function: createCharArray 
	returns a java Character array of the supplied size 
	 
	
		
	Detail: 
		When working with striong data or streams it is often necessary to pass 
		a Character array to java functions as a buffer. This function will 
		create this buffer for you 
	*/
	Myna.createCharArray=function Myna_createCharArray(size){
		return new java.lang.reflect.Array.newInstance(java.lang.Character.TYPE,size);	
	}
/* Function: dump 
	returns nested HTML table representing the supplied object
	 
	Parameters: 
		obj			-	Object to dump
		label		-	*Optional* 
						Caption for the dump table
		maxDepth	-	*Optional, default=4* 
						Maximum depth of recursion. This is	to protect against 
						circular references and to speed performance. 
 
	Returns: 
		Nested HTML and (client-side) JavaScript table representing the supplied object
	
	*/
	Myna.dump=function Myna_dump(obj,label,maxDepth){
		var result,	// string result that will be returned
			d;		// recursive dump function
		if (maxDepth == undefined) maxDepth=4;
		if (label) {
			label = label;
		}
		result=[
			'<style>',
				'.dump_toggle_table_left{',
					'width:1px;',
					'font-weight:bold;',
					'cursor:pointer;',
					'background-color:linen;',
					'border:1px solid black;',
				'}',
				
				'.dump_toggle_table_right{',
					'cursor:normal;',
					'background-color:white;',
					'border:1px solid black;',
				'}',
				'.dump_toggle_table caption{',
					'background-color:silver;',
					'font-weight:bold;',
					'border:1px solid black;',
				'}',
				
				
				
				'.query td{',
					'border:1px solid purple;',
					'background-color:#e2b2f4;	',
				'}',
				'.query .dump_toggle_table_right {',
					'background-color:white;',
				'}',
				'.query .dump_toggle_table_left, .query_head th {',
					'font-size:9pt;',
					'width:1px;',
					'font-weight:bold;',
					'cursor:pointer;',
					'background-color:#a481b1;',
					'border:1px solid purple;',
					'color:black;',
					'padding:2px;',
				'}',
				'.query caption{',
					'background-color:#a481b1;',
					'border:1px solid purple;',
					'color:black;',
				'}',
				'.array td{',
					'border:1px solid green;',
					'background-color:#c6ffc7;	',
				'}',
				'.array .dump_toggle_table_left  {',
					'width:1px;',
					'font-weight:bold;',
					'cursor:pointer;',
					'background-color:#94ff96;',
					'border:1px solid green;',
					'color:black;',
					'padding:2px;',
				'}',
				'.array caption{',
					'background-color:#94ff96;',
					'border:1px solid green;',
					'color:black;',
				'}',
				
				'.object td{',
					'border:1px solid blue;',
					'background-color:#c6cdff;	',
				'}',
				'.object .dump_toggle_table_left  {',
					'width:1px;',
					'font-weight:bold;',
					'cursor:pointer;',
					'background-color:#788aff;',
					'border:1px solid blue;',
					'color:black;',
					'padding:2px;',
				'}',
				'.object caption{',
					'background-color:#788aff;',
					'border:1px solid blue;',
					'color:black;',
				'}',
				
				
				
				'.dump_toggle_table{',
					
					'border:1px solid black;',
				'}',
				'.dump_toggle_table table{',
					'width:100%;',
				'}',
				'.dump_toggle_table td, .dump_toggle_table caption{',
					'font-family:sans-serif;',
					'font-size:9pt;',
				'}',
			'</style>',
			'<script>',
				'function _dump_toggle(left_side){',
					'var ns = left_side.nextSibling; ',
					'if (ns.style.display == \'none\'){',
						'ns.style.display=\'\';',
					'} else {',
						'ns.style.display=\'none\';',
					'}',
					
				'}',
			'</script>',
		].join('\n')
		

		d=function(obj,maxDepth){
			var my = arguments.callee,		//referenence to this function for the purpose of accessing static variables
				result,						// function local result object to hold the result of this call
				keys,						// stores result of Myna.getKeys()
				type,						// stores classname of object
				x,							// loop counter
				row,
				col
				
			
			
			if (!maxDepth) return "[ max recusion ]";
			 
			if (!my["max_r"]) my.max_r=1;
			
			result="";
			try{
			switch (ObjectLib.typeOf(obj)){
				case "array":
					if (obj instanceof Myna.DataSet){
						keys = ObjectLib.getKeys(obj,true).filter(function(prop){
								return prop != parseFloat(prop);
						});
						result+='<table class="query" border="0" cellspacing="0"><caption>DataSet</caption>';
						for (x=0; x < keys.length; ++x) {
						result+=	'<tr>'+
							'<td class="dump_toggle_table_left"'+
								'valign="top" '+
								'onclick="_dump_toggle(this)"'+
							'>' + keys[x] + '</td>'+
							'<td '+'class="dump_toggle_table_right" valign="top">';
				
							if (keys[x] != parseFloat(keys[x])){
								result+=d(obj[keys[x]],maxDepth-1)
							}
							
							result+=
								'</td>'+
							'</tr>';
						}
						result+=
							'<tr><td class="dump_toggle_table_left"'+
								'valign="top" '+
								'onclick="_dump_toggle(this)"'+
								'></td><td class="dump_toggle_table_right" valign="top">'+
							'<table height="1"  border="1" ><caption>Data:</caption>'+
								'<tr class="query_head">';
								for ( col=0; col < obj.columns.length; ++col) {
									result+=
									'<th class="">'+
										 obj.columns[col] +
									'</th>';
								}
								
								result+=
								'</tr>';
								for (row=0; row < obj.length; ++row) {
									result+=
									'<tr>';
										for (col=0; col < obj.columns.length; ++col) {
											var value=obj[row][obj.columns[col]];
											if (value === null || value ===undefined) value="";
											
											result+=
											'<td class="" ' +(value.length < 50?"nowrap":"")+'>'+
												value + 
											'</td>';
											
										}
									result+=
									'</tr>';
								}
								result+=
							'</table></td></tr>'
						result+=
						'</table>';
					} else {
						result +='<table class="array dump_toggle_table" border="0" cellspacing="0"><caption>Array</caption>'
						for ( x=0; x < obj.length; ++x){
							//if (typeof obj[x] == "function") continue;
							result +=[
								'<tr>',
									'<td class="dump_toggle_table_left"',
										'valign="top" ',
										'onclick="_dump_toggle(this)"',
									'>' + x +'</td><td class=" dump_toggle_table_right" valign="top">' + d(obj[x],maxDepth-1) + '</td>',
								'</tr>',
							].join('\n');
						}
						result +='</table>'
					}
				break;
				case "null":
					result +='NULL'
				break;
				case "date":
					result += obj.toString();
				break;
				case "object":
					keys = ObjectLib.getKeys(obj,true);
					
					if (obj instanceof Myna.Query ){
						result+='<table class="query" border="0" cellspacing="0"><caption>QueryResult</caption>';
						for (x=0; x < keys.length; ++x) {
						result+=	'<tr>'+
							'<td class="dump_toggle_table_left"'+
								'valign="top" '+
								'onclick="_dump_toggle(this)"'+
							'>' + keys[x] + '</td>'+
							'<td '+'class="dump_toggle_table_right" valign="top">';
							
							if (keys[x] == "data") {
								result+=
								'<table height="1"  border="1" >'+
									'<tr class="query_head">';
									for ( col=0; col < obj.columns.length; ++col) {
										result+=
										'<th class="">'+
											 obj.columns[col].name +
										'</th>';
									} 
									result+=
									'</tr>';
									for ( row=0; row < obj.data.length; ++row) {
										result+=
										'<tr>';
											for (col=0; col < obj.columns.length; ++col) {
												result+=
												'<td class="">'+
													obj.data[row][obj.columns[col].name.toLowerCase()] + 
												'</td>';
											}
										result+=
										'</tr>';
									}
								result+=
								'</table>'
							} else if (keys[x] == "sql") {
								result+=
								'<pre>' + obj.formatSql().escapeHtml() + '</pre>';
							} else if (keys[x] == "result") {
								result+=d(obj[keys[x]].toJson().parseJson(),maxDepth-1)
							} else  {
								result+=d(obj[keys[x]],maxDepth-1)
							} 
							result+=
								'</td>'+
							'</tr>';
						}
						result+=
						'</table>';
					} else {
						keys = ObjectLib.getKeys(obj,true);
						if (keys.length){
							if (obj["getClass"]){
								type =obj.getClass.toString(); 
							} else {
								 type ="Object"
							}
							result +='<table class="object" border="0" cellspacing="0"><caption>' + type + '</caption>'
							for (x=0; x < keys.length; ++x){
								result +=[
									'<tr>',
										'<td class="dump_toggle_table_left"',
											'valign="top" ',
											'onclick="_dump_toggle(this)"',
										'>' + keys[x] + '</td><td class="dump_toggle_table_right" valign="top">' + d(obj[keys[x]],maxDepth-1) + '</td>',
									'</tr>',
								].join('\n')
							}
							result +='</table>';	
						} else if (String(obj) == "[object Object]"){
							result += "[No Data Properties]";
						} else {
							result +=String(obj);	
						}
					}
					//result += obj instanceof Date;
				break;
				
				case "class":
					result +=[
						'<table border="0">',
							'<caption>' + obj.getClass() + '</caption>',
							'<tr><td>' + obj.toString()  + '</td></tr>',
						'</table>',
					].join('\n')
				break;
				
				case "number":
				case "string":
				case "boolean":
					result += String(obj);
				break;
				case "function":
					result += "[object Function]";
				break;
				default:
					result += typeof obj 
				break;
				
			}
			} catch(e){ return e.toJson()}
				
			return result;
		}
		
		//result += d(obj,maxDepth);
		result += [
			'<table class="dump_toggle_table">',
			label?'<caption style="cursor:pointer" onclick="_dump_toggle(this)">' + label  + '</caption><tr>':'',
					'<td>' + d(obj,maxDepth) + '</td>',
				'</tr>',
			'</table>',
		].join('\n')
		return result;
	}
/* Function: executeShell 
	Executes a shell command/script
	 
	Parameters: 
		shellCommand	-	Command shell to execute such as "cmd", "csh", "bash". 
							Can include a platform specific path and arguments 
							to the shell like "/bin/perl -I/usr/local/perl_includes" 
		script			-	String of commands to execute in the shell
		waitForOutput	-	*Optional, default=true* If true, this function will 
							wait for the script to complete and return a result object 
							with stderr, stdout, and the exit code. If False returns  
							empty result object immediately
							
	Returns: 
		A JavaScript object that looks like this:
		
		(code)
		{
			output:"here is the stdout",
			errors:"here is the stderr",
			exitCode:-1
		}
		(end)
		
	Detail: 
		This function attempts to execute the supplied script in the supplied shell. 
		This is obviously platform dependent, so you may want to consult <$server.osName>. 
		It saves _script_ to a tempfile and then executes _shellCommand_ with the temp file 
		name as the last parameter 
	 
	*/
	Myna.executeShell=function Myna_executeShell(shellCommand,script,waitForOutput){
		var
			runtime = java.lang.Runtime.getRuntime(),
			process, 		//holds java.lang.Process object returned by exec
			curLine,		// current line of process output
			reader,			//buffered reader for process output
			systemPath, 	//filesystem path to script file
			scriptFile,		// java.io.File of script file
			result={output:"",errors:"",exitCode:-1},		//output object to store output, errors, and exitCode
			scriptPath = Myna.File.createTempFile("shl");	//URI of script file
			
		if (waitForOutput === undefined) waitForOutput=true;
		
		scriptFile = new Myna.File(scriptPath);
		systemPath = scriptFile.javaFile.getAbsolutePath();
		
		//write the script to the temp file
		scriptFile.writeString(script);
		
		process = runtime.exec(shellCommand + " " + systemPath,null,scriptFile.javaFile.getParentFile());
		
		if (waitForOutput){
			reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()));
			
			while ((curLine = reader.readLine())){
				result.output += curLine + "\n";
			}
			
			reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getErrorStream()));
			
			while ((curLine = reader.readLine())){
				result.errors += curLine + "\n";
			}
			
			process.waitFor();
			result.exitCode = process.exitValue();
		}
		scriptFile.forceDelete();
		return result;
		
	}
/* Function: enableServerJS 
	eneables the ServerJS runtime environment
	 
	Detail: 
      Calling this function enables the "require" funciton, and gives access to 
      the ServerJS standard libraries. If you call this in your application.sjs
      file you can enable ServerSJ for a directory and its decendents
		
	See:
      https://wiki.mozilla.org/ServerJS
	*/
	Myna.enableServerJS=function Myna_enableServerJS(){
      if (!("require" in $server.globalScope)){
         /* if ($server_gateway.generalProperties.getProperty("strict_error_checking") == '1'){
            throw new Error("ServerJS support in only available when Strict Error checking is disabled");
         } else {  */
            Myna.includeOnce("/WEB-INF/narwhal/platforms/myna/bootstrap.sjs");
         /* } */
		}
	}
/* Function: formatError 
	returns an html formatted string representing the supplied exception. 
	 
	Parameters: 
		e - a caught exception  
 
	*/
	Myna.formatError=function Myna_formatError(e){
		/* if (e instanceof Packages.org.mozilla.javascript.RhinoException){ */
		if (e.sourceName){
			e = {rhinoException:e}	
		}
		
		
		if (e.rhinoException){
			e.lineNumber = e.rhinoException.lineNumber();
			e.fileName = e.rhinoException.sourceName();
			e.message = e.rhinoException.details();
		}
		
		e.rootIndex=0;
		if (e.rhinoException && !$server.isThread){
			var stack =Myna.parseJsStack(e);
			for (var x=0;x < stack.length;++x){
				/* $server_gateway.currentDir + $server_gateway.scriptName */
				if (String(stack[x]).indexOf("/shared/js/") ==-1 ){
					var parts = stack[x].match(/at (.*?):(\d+)/);
					e.fileName = parts[1];
					e.lineNumber = parts[2]; 
					e.rootIndex=x+1;
					break;
				} 
			}	
		} 
		
		
		var errorTpl = new Myna.XTemplate(
			'<div class="myna_error_div">',
				'<h1>An Error has Occurred:</h1>',
				'{content}',
			'</div>',
			'<style>',
				'h1{',
					'font-size:14pt;',
				'}',
				'.myna_error_div{',
					'background-color:silver;',
					'border:2px solid brown;',
					'padding:10px;',
					'margin:10px;',
					'width:"99%";',
				'}',
				'.myna_error_div .error_line{',
					'background-color:pink;	',
					'border:1px solid red;	',
				'}',
				'.myna_error_div, .myna_error_div td,.myna_error_div th{',
					'font-family:sans-serif;',
					'font-size:10pt',
				'}',
				'.myna_error_div th{',
					'text-align:right;	',
					'width:80;',
					'vertical-align:top;',
					'color:white;',
					'background-color:darkblue;',
				'}',
				'.myna_error_div td{',
					'background-color:white;',
					'border:1px solid darkblue;',
				'}',
				'.myna_root_line{',
					'font-weight:bold;',
				'}',
			'</style>'
			
			
		)
		var standardTpl = new Myna.XTemplate(
			'\n\n\n\n<!-- ',
				'\n\tERROR: {message}',
				'\n\tFILE: {fileName}',
				'\n\tLINE:{lineNumber}',
			'\n-->\n\n\n\n',
			'<table width="100%" height="1" cellpadding="5" cellspacing="0" border="0" >',
				'<tr><th >Message:</th><td>{message}</td></tr>',
				'<tr><th >File:</th><td>{fileName}</td></tr>',
				'<tr><th >Line:</th><td>{lineNumber}</td></tr>',
				'<tr><th >Stacktrace:</th><td>',
					'<tpl for="jsStack">',
					'<div class="{[ xindex == parent.rootIndex? "myna_root_line":"" ]}" style="padding-left:{#}0">{.}</div>',
					'</tpl>',
				'</td></tr>',
				'<tr><th >Query:</th><td>{query}</td></tr>',
				'<tr><th >File Context:</th><td>',
					'<pre>',
					'<tpl for="lines">',
						'<div class="{[ parent.lineNumber == values.lineNumber? "error_line":"" ]}">{lineNumber}: {lineText}</div>',
					'</tpl>',
					'</pre>',
				'</td></tr>',
				'<tr><th >Memory Context:</th><td>',
					'<pre>',
					'<tpl for="scriptLines">',
						'<div class="{[ parent.lineNumber == values.originalIndex? "error_line":"" ]}">{lineNumber}: {lineText}</div>',
					'</tpl>',
					'</pre>',
				'</td></tr>',
				'<tr><th >Java Stacktrace:</th><td>',
					'<tpl for="javaStack">',
						'<div >{.}</div>',
					'</tpl>',
				'<tr><th >$req:</th><td>{req}</td></tr>',
				'</td></tr>',
			'</table>'
		)
		
		
		
		if (e.fileName !== undefined && e.lineNumber !== undefined && e.message !== undefined){
			e.fileName = String(e.fileName).split(/#/)[0];
			var lines ;
			try{
				lines =new Myna.File(e.fileName).readLines().map(function(element,index){
					return {
						lineNumber:index+1,
						lineText:element.escapeHtml()+"\n"
					}
				})
				.filter(function(element,index){
					return e.lineNumber -10 < element.lineNumber && element.lineNumber < e.lineNumber +10; 
				})
				
			}catch(e){lines="unavailable"}
				
				
			var data ={
				message:e.message,
				fileName:e.fileName,
				lineNumber:e.lineNumber,
				jsStack:["unavailable"],
				javaStack:["unavailable"],
				rootIndex:e.rootIndex,
				req: Myna.dump($req.data,"Request Data",10),
				lines:lines,
				scriptLines:String($server_gateway.currentScript).split(/\n/)
					.map(function(element,index){
						return {
							lineNumber:index+1,
							lineText:element.escapeHtml()+"\n"
						}
					})
					.filter(function(element,index){
						return e.lineNumber -10 < element.lineNumber && element.lineNumber < e.lineNumber +10; 
					})
			}
				data.jsStack=e.rhinoException?Myna.parseJsStack(e):Myna.dump(e);
				data.javaStack=e.rhinoException?Myna.parseJavaStack(e):"unavailable";	
			if (e.query){
				data.query = Myna.dump(e.query)	
			}	
			return errorTpl.apply({
				content:standardTpl.apply(data)
			})
		} else {
			return errorTpl.apply({content:Myna.dump(e)})
		}
	}

/* Function: freeMemory 
	attempts to free the specified amount of memory within the timeout, returning 
	true if successful.
	 
	Parameters: 
		size		-	number of bytes to free
		timeout 	-	*Optional, default 0*
						timeout in miliseconds to wait for memory to become available; 
 
	Returns: 
		true if memory is available
		
	Detail: 
		if _timeout_ is 0, or memory is currently avaialble, this function will 
		return immediately. Otherwise this function will repeatedly 
		call System.gc() to attempt to free memory until enough is 
		available or the _timeout_ is exceeded
		
	See:
		<$server.memMax>, 
		<$server.memCurrent>, 
		<$server.memAvailable>, 
		<$server.memFree>,
		<$server.memUsed>
	*/
	Myna.freeMemory=function Myna_freeMemory(size,timeout){
		if (!timeout) timeout=0;
		
		if ($server.memAvailable > size ) return true;
		var start = new Date().getTime();
		while(new Date().getTime()-start < timeout){
			java.lang.System.gc();
			if ($server.memAvailable > size ) return true;
			Myna.sleep(parseInt(Math.max(10,timeout/10)));
		}
		return false;
	}	
	
/* Function: enumToArray 
	Converts a Java enumeration into a JavaScript Array.
		
	Parameters: 
		enumeration - Java enumeration to iterate over
 
	Returns: 
		JS Array object
		
	*/
	Myna.enumToArray=function Myna_enumToArray(enumeration){
		var element,
			result=[];
		while (enumeration.hasMoreElements()) {
			element = enumeration.nextElement()
			result.push(element);
			
		}
		return result;
	}
	
/* Function: getGeneralProperties 
	Returns the Java Properties object loaded from /WEB-INF/classes/general.properties
	 
	*/
	Myna.getGeneralProperties=function Myna_getGeneralProperties(){
		return Myna.mapToObject($server_gateway.generalProperties)
	}
/* Function: include 
	Includes a text file or executes a .js, .sjs, or .ejs file in the current thread
	 
	Parameters: 
		path	-	<MynaPath> repesenting location of file 
		scope 	-	*Optional, default <$server.globalScope>* This is the 
					object that will be passed as the "this" object to the 
					script. Set this to null to force code files to treated as text
 
	Returns: 
		void
		
	Detail:
		If the file extention is one of js, sjs, or ejs:
		
		This function executes the the script at _path_ against the supplied _scope_.
		This behavior is similar to the JavaScript "apply" function. The code in the file will be 
		treated like the body of a function on _scope_.
		
		If the file is not one of the above extentions, or if _scope_ is null:
		
		This function prints the text of the file
		
	See:
		* http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Function:apply
		* <Myna.includeOnce>
		
	*/
	Myna.include=function Myna_include(path,scope){
		var file =new Myna.File(path); 
		if (typeof $profiler !== "undefined") $profiler.begin("Include " + path);
		var content =file.readString();
		var type="text";
		
		if (/.*.ejs$/.test(path)){
			type="ejs";
			content = "<"+"%try{%" +">" + content 
				+"<" +"%} catch(e) {if (__exception__ && !e.rhinoException) e.rhinoException=__exception__;if($application && $application._onError) {$application._onError(e)} else{throw(e)}}%" +">";
		} else if (/.*.sjs$/.test(path) || scope){
			type="sjs";
			content = "try{" + content 
				+"} catch(e) {if (__exception__ && !e.rhinoException) e.rhinoException=__exception__; if($application && $application._onError) {$application._onError(e)} else{throw(e)}}";
		}
		content +="\n";
		if (type =="text" || scope === null){
			$res.print(content);
		} else if (scope){
			/* if ($server.isThread){
				$server_gateway.threadScope.applyTo(scope);
			} */
			
			$server_gateway.executeJsString(scope,content,path);
		} else {
			$server_gateway.executeJsString($server_gateway.threadScope,content,path);
		} 
		
		if (typeof $profiler !== "undefined") $profiler.end("Include " + path);
	}
	/* Experimental code */
	/* Myna.evalIinclude=function Myna_evalIinclude(path,scope){
		if (/thread2.sjs/.test(path)){
			Myna.log("debug","starting "+path);	
		}
		var file =new Myna.File(path); 
		if (typeof $profiler !== "undefined") $profiler.begin("Include " + path);
		//var code =file.readString();
		var code =String($server_gateway.translateString(file.readString(),file.toString()));
		code = "try{" + code  +"} catch(e) {if (__exception__ && !e.rhinoException) e.rhinoException=__exception__; if($application && $application._onError) {$application._onError(e)} else{throw(e)}}";
		code +="\n";
		var f =function(){
			eval(code);
		}
		if (scope){
			f.apply(scope);	
		} else {
			f.apply();	
		}
		if (typeof $profiler !== "undefined") $profiler.end("Include " + path);
	} */
/* Function: includeOnce   
	Includes a text file or executes a .js, .sjs, or .ejs file in the current thread, if that path has not already been loaded. 

	Parameters: 
		path	-	<MynaPath> repesenting location of file 
		scope 	-	*Optional, default <$server.globalScope>* This is the 
					object that will be passed as the "this" object to the 
					script
 
	Returns: 
		void
		
	Detail:
		This function will call <include> for this path only once in this request.
		
	See:
		* <Myna.include>
		
	*/
	Myna.includeOnce=function Myna_includeOnce(path,scope){
		var file =new Myna.File(path); 
		if ($server_gateway.uniqueIncludes_.add(file.toString())){
			Myna.include(path,scope);
		}
	}
/* Function: includeContent   
	Includes a text file or executes a .js, .sjs, or .ejs file in the current thread, and returns the output instead of printing 

	Parameters: 
		path	-	<MynaPath> repesenting location of file 
		scope 	-	*Optional, default <$server.globalScope>* This is the 
					object that will be passed as the "this" object to the 
					script
 
	Returns: 
		content generated by the included file
		
	See:
		* <Myna.include>
		
	*/	
	Myna.includeContent=function Myna_includeContent(path,scope){
        var oldContent = $res.clear();
        Myna.include(path,scope);
        var newContent = $res.clear();
        $res.print(oldContent);
        return newContent;
	}
/* Function: includeTemplate   
	Includes a template file (.tpl), 

	Parameters: 
		path	-	<MynaPath> repesenting location of file 
		scope 	-	*Optional, default <$server.globalScope>* This is the 
					object that will be passed as the "this" object to the 
					script
 
	Returns: 
		void
		
	Detail:
		This function will only execute referenced file once per request.
		The includeOnce function executes the the script at _path_ against the supplied _scope_.
		This behavior is similar to the JavaScript "apply" function. The code in the file will be 
		treated like the body of a function on _scope_. 
		
		
		
	See:
		* http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Function:apply
		* <Myna.include>
		
	*/
	Myna.includeTemplate=function Myna_includeTemplate(path,values){
		$profiler.begin("Including template " + path);
		var template = new Myna.Template(new Myna.File(path).readString())
		
		$res.print(template.apply(values))
		
		$profiler.end("Including template " + path);
	}

/* Function: loadProperties 
	loads a Java properties file and returns it as a JavaScript object 
	 
	Parameters: 
		filepath	-	<MynaPath> of properties file
 
	Returns: 
		JavaScript object of the Properties Map, as per <Myna.mapToObject>
		
	 
	*/
	Myna.loadProperties=function Myna_loadProperties(filepath){
		var result= {}
		var props = new java.util.Properties();
		
		props.load(new java.io.FileInputStream(new Myna.File(filepath).javaFile));
		
		var e = props.propertyNames();
		while(e.hasMoreElements()){
			var key = e.nextElement();
			result[key] = String(props.getProperty(key));
		}
		
		return 	result;
	}
/* Function: log 
	logs a string to the general log table 
	 
	Parameters: 
		type		- 	Any short text value representing the type of log, such 
						as DEBUG, INFO, ERROR, WARN, PROFILE, etc. This value is 
						forced upper case
		label		-	As short single-line text description of the log
		detail		-	*Optional, default null* an HTML description of the log 
		app_name	-	*Optional, default $application.appName* A short text 
						value representing the application that generated the 
						log.  This value is forced lower case
	Detail:
		This function logs to the myna_log_general table in the myna_log 
		datasource. If you run multiple instances of Myna, it may be helpful to 
		point the myna_log datasource of each instance to the same database. You
		Can view the logs through the Myna Adminstrator
	 
	*/
	Myna.log=function Myna_log(type,label,detail,app_name){
		var purpose = "UNKNOWN";
		var now = new Date();
		var log_elapsed = 0
		if (typeof $server !="undefined"){
			if (!$req.last_log_time) $req.last_log_time = now;
			if (!$req.last_log_ordinal) $req.last_log_ordinal = 0;
			log_elapsed = now.getTime() - $req.last_log_time.getTime();
			
			$req.last_log_time = now;
			if (!app_name) {
				if ($application && $application.appName){
					app_name=$application.appName;
				}
			}
		}
		if (!app_name) app_name="unknown"; 
		
		var req_elapsed = now.getTime() - $server_gateway.started.getTime();
				
		
		if (!label) label= "[ no label ]";
			if (!type) throw new Error("Type Required")
			if (!detail) detail = " ";
		
		
		if (typeof $server != "undefined" && !$server.isThread){
			var reqId = $req.id;
			//String(java.lang.Thread.currentThread().getName().hashCode());
			
			var logFunction = function(reqId,type,label,detail,app_name,log_elapsed,req_elapsed,now){
				try{
					new Myna.DataManager("myna_log").getManager("myna_log_general").create({
						app_name:app_name,
						detail:detail,
						event_ts:now,
						hostname:$server.hostName,
						instance_id:$server.instance_id,
						label:String(label).left(255),
						log_elapsed:log_elapsed,
						log_id:Myna.createUuid(),
						purpose:$server.purpose,
						request_elapsed:req_elapsed,
						request_id:reqId,
						type:type 
					})
				} catch(e){
					java.lang.System.err.println("Error writing log: " + e.message);
					java.lang.System.err.println(label);
				}
			}
			new Myna.Thread(logFunction,[reqId,type,label,detail,app_name,log_elapsed,req_elapsed,now],-.9);
		 
		} else {
			$server_gateway.writeLog(
				type,
				String(label).left(255),
				detail,
				app_name,
				String(java.lang.Thread.currentThread().getName().hashCode()),
				req_elapsed,
				log_elapsed,
				now
			);
		}
			
				
	}
/* Function: mapToObject 
	returns a Java Map as a JavaScript Object
	 
	Parameters: 
		map - Java Map (or subclass/implementation) 
 
	Returns: 
	 	a Java Map as a JavaScript Object
		
	Detail: 
		This function loops through all of the entries in the map and
		creates a property on the returned object for each key and sets
		it equal to the entry's value.
	 
	*/
	Myna.mapToObject=function Myna_mapToObject(map){
		var keyValueArray = map.entrySet().toArray();
		var result={}
		for (var x=0; x < keyValueArray.length; ++x){
			var property = keyValueArray[x].getKey();
			result[property] = keyValueArray[x].getValue();
			if (result[property] instanceof java.lang.String){
				result[property] = String(result[property]);
			}
		}
		return result;
	}
/* Function: parseJavaStack 
	returns an array of strings representing each line of the Java stack 
	in the supplied error object
	 
	Parameters: 
		e - a caught exception  
 
	Detail: 
		This function calls Java's internal stacktrace function and splits the 
		result by line
	 
	*/
	Myna.parseJavaStack=function Myna_parseJavaStack(e){
		
		/* forvar originalTrace = new java.io.StringWriter();
		var pw = new java.io.PrintWriter(originalTrace);
		
		e.rhinoException.printStackTrace(pw);
		
		var lines = String(originalTrace).split(/\n/);
		return lines.filter(function(e){
			return e.length;
		}) */
		
		return e.rhinoException.getStackTrace()
		.map(function(e){
			return String(e)
		})
	}
/* Function: parseJsStack 
	returns an array of strings representing each line of the javascript stack 
	in the supplied error object
	 
	Parameters: 
		e - a caught exception  
 
	Detail: 
		This function calls Rhino's internal stacktrace function and splits the 
		result by line
	 
	*/
	Myna.parseJsStack=function Myna_parseJsStack(e){
		
			/* var originalTrace = new java.io.StringWriter();
			var pw = new java.io.PrintWriter(originalTrace);
			
			e.rhinoException.printStackTrace(pw);
			
			var lines = String(originalTrace).split(/\n/);
			return lines.filter(function(e){
				return e.length && (
					/\(file:/.test(e)
				);
			})  */
			
			
			return String(e.rhinoException.getScriptStackTrace())
			.split(/\n/).filter(function(e){
				return e.length;
			})
		
	}
/* Function: print 
	This is an alias for <$res.print>
	 
	Parameters: 
		string -  string to append to the output buffer
 
	Returns: 
		void
	 
	*/
	Myna.print=function Myna_print(string){
		$res.print(String(string));
	}
/* Function: sealObject 
	This seals a JavaScript object, preventing it from being modified.
	 
	Parameters: 
		obj -  JavaScript Object to seal
 
	
	 
	*/
	Myna.sealObject=function Myna_sealObject(obj){
		$server_gateway.sealObject(obj);
	}	
			
/* Function: saveProperties 
	Saves the supplied object as a Java Properties file
	 
	Parameters: 
		object		-	A Java or JavaScript Object
		filepath 	-	<MynaPath> of destination file
 
	Returns: 
		void
		
	Detail: 
		This function loops over the keys of _object_, 
		and saves each non-function property and it's value as a Java properties 
		file. 
		
	See:
		<Myna.getKeys>
	*/
	Myna.saveProperties=function Myna_saveProperties(object,filepath){
		var props = new java.util.Properties();
		var keys = ObjectLib.getKeys(object);
		for (var x=0; x < keys.length; ++x){
			props.setProperty(keys[x],object[keys[x]]);	
		}
		
		props.store(new java.io.FileOutputStream(new Myna.File(filepath).javaFile),"");
	}
		
/* Function: sleep 
	pauses execution of the current thread for _time_ milliseconds
	 
	Parameters: 
		time 	-	time in miliseconds pause execution; 
 
	*/
	Myna.sleep=function Myna_sleep(time){
		if (parseInt(time) != time ) return;
		
		java.lang.Thread.sleep(time);
	}	
 