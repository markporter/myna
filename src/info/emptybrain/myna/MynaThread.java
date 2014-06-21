package info.emptybrain.myna;

import java.io.*;
import java.net.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.sql.DataSource;
import java.lang.reflect.*;

//import org.mozilla.javascript.*;
//import org.mozilla.javascript.serialize.*;
//import org.mozilla.javascript.commonjs.module.*;
//import org.mozilla.javascript.commonjs.module.provider.*;

import jdk.nashorn.internal.runtime.*;
import jdk.nashorn.internal.runtime.options.*;
import jdk.nashorn.api.scripting.*;
import java.util.*;
import java.util.regex.*;
import java.sql.*;
import org.apache.jcs.*;
import org.apache.jcs.engine.behavior.*;
import org.apache.commons.pool.impl.*;
import org.apache.commons.dbcp.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory; 
//import EDU.oswego.cs.dl.util.concurrent.*;
import java.util.concurrent.*;
import org.openid4java.consumer.ConsumerManager;

/**
* This class handles the execution of *.sjs and *.ejs files
*
*/

public class MynaThread implements java.lang.Runnable{
	//static public Log logger = LogFactory.getLog(MynaThread.class);
	static public volatile CopyOnWriteArrayList 	runningThreads 		= new CopyOnWriteArrayList();
	static public volatile CopyOnWriteArrayList 	recentThreads 			= new CopyOnWriteArrayList();
	
	static public String 				version					="";
	static public Semaphore 			threadPermit;
	static public Semaphore 			manageLocksPermit;
	static public ConcurrentHashMap 	dataSources 			= new ConcurrentHashMap(); //stores ds properties
	static public ConcurrentHashMap 	javaDataSources 		= new ConcurrentHashMap(); //stores dbcp BasicDataSource instances
	static public ConcurrentHashMap 	locks 					= new ConcurrentHashMap(); //used by Myna.getLock()
	static public ConcurrentHashMap 	scriptCache 			= new ConcurrentHashMap();
	static public Properties			generalProperties 		= new Properties();
	static public ConcurrentHashMap 	serverVarMap 			= new ConcurrentHashMap();//used by $server.get/set
	static public ConcurrentHashMap 	applications 			= new ConcurrentHashMap();//contains Application descriptors, keyed by path
	static private boolean 			isInitialized 				= false;
	
	static public int 				threadHistorySize			=0; // number of completed threads to store in recentThreads. Set with property "thread_history_size"
	static public java.util.Date 	serverStarted 				= new java.util.Date(); //date object representing the time this server was started
	
	static public ConsumerManager	openidConsumerManager; //initialized in init

	static public ExecutorService 		backgroundThreadPool	=Executors.newFixedThreadPool(2);
	static public PriorityBlockingQueue<CronTask> 		waitingCronTasks	= new PriorityBlockingQueue<CronTask>();

	static public String 				rootDir					= null; // system path to the Myna deployment folder
	static public String 				rootUrl; // url to the myna root directory from / , not including protocol and server

	static private final ThreadLocal<MynaThread> currentThread = new ThreadLocal<MynaThread>();
	static public ScriptObject 			sharedGlobalScope;
/* static CLasses*/
	static class MynaErrorManager extends ErrorManager{
		public MynaErrorManager() { super(); }
		public MynaErrorManager(PrintWriter err) { super(err); }
		public MynaThread mt;


		public void error(ParserException e) {
			System.err.println("Error Manager: " + e);
			if (mt != null){
				try{
					mt.handleError(e);
				} catch (Exception ex){
					System.err.println("Error handling last error: " + ex);
				}
			}
		}

		
	}
	
/* Static functions*/	
	public static MynaThread getCurrentThread() {
		return currentThread.get();
	}
/* End static resources */


	public final java.lang.Thread 		javaThread 				= java.lang.Thread.currentThread();
	public boolean 						isInitThread 			= false; //Is this the first thread after server restart?
	public boolean 						isWaiting				= true;// am I waiting for a thread permit?
	public boolean 						isWhiteListedThread	= false;// can  I  bypass thread management?
	public int 							requestTimeout			= 0; //maximum time this thread should run. Set in general.properties
	public boolean 						shouldDie				= false; //if true, this thread will be killed in objserveInstructionCount
	
	public boolean 						inError 					= false; //Are we currently handling an error?
	
	public ConcurrentHashMap 			environment 			= new ConcurrentHashMap();
	public ConcurrentHashMap 			runtimeStats 			= new ConcurrentHashMap();

	public ConcurrentHashMap 			translatedSources 	= new ConcurrentHashMap();

	
	
	public Context 						threadContext;
	public ScriptObject 				threadScope;
	
	
	
	
	public String 							requestDir; // system path to the directory containing the originally requested script
	public boolean 						requestHandled			=false; // if true, than this thread has handled all output management and parent should not modify output
	
	public String 							currentDir; // system path to the directory containing the currently running script
	public String 							currentScript; // text of the currently running script
	
	
	
	public String 							scriptName; //name of the currently running script
	public String 							requestScriptName; // name of the originally requested script
	
	
	public java.util.Date 				started 					= new java.util.Date(); //date object representing the time this request was started
	
	public StringBuffer 					generatedContent 		= new StringBuffer("");
	
	public Set 								uniqueIncludes_	 	= Collections.synchronizedSet(new HashSet());
	
	public Vector 							threadChain 			= new Vector(); //history of thread calls. Used to avoid infinite recursion
	
	
	public boolean							isExiting				=	false; // set in the timeout handler to prevent further attempts to timoute the thread
/* End properties*/	
	

		
	public MynaThread() throws Exception{
		
		//ContextFactory.initGlobal(new CustomContextFactory());
		final PrintStream pout = new PrintStream(System.out);
        final PrintStream perr = new PrintStream(System.err);
        final PrintWriter wout = new PrintWriter(pout, true);
        final PrintWriter werr = new PrintWriter(perr, true);

        // Set up error handler.
        final ErrorManager errors = (ErrorManager) new MynaErrorManager(werr);
        ((MynaErrorManager)errors).mt = this;
        final Options options = new Options("nashorn", werr);
        options.set("scripting", true);
       
        this.threadContext = new Context(options, errors, wout, werr, Thread.currentThread().getContextClassLoader());
	}
	
	
	/**
	* init loads standard objects (settings, etc)
	*
	*/
	public void init() throws Exception{
		
		synchronized (MynaThread.class){
			loadGeneralProperties();
			int max_running_threads = Integer.parseInt(generalProperties.getProperty("max_running_threads"));
			threadPermit = new Semaphore(max_running_threads);
			int background_thread_pool = Integer.parseInt(generalProperties.getProperty("background_thread_pool"));
			Executors.newFixedThreadPool(background_thread_pool);
			manageLocksPermit = new Semaphore(1,true);
			
			this.threadHistorySize = Integer.parseInt(generalProperties.getProperty("thread_history_size"));
			loadDataSources();
			createSharedScope();
			this.isInitialized = true;
		}
	}
	
	public  ScriptObject createSharedScope() throws Exception{
		//save state
		
		String currentDir = this.currentDir;
		String currentScript = this.currentScript;
		String scriptName = this.scriptName;
		String requestScriptName = this.requestScriptName;
		
		runtimeStats.put("currentTask","Building Shared Scope");
		
		//System.err.println("re-creating scope");
		
		this.threadScope = sharedGlobalScope = threadContext.createGlobal();
		this.threadContext.setGlobal(this.threadScope);
		this.threadContext.load(this.threadScope,"nashorn:mozilla_compat.js");
		try{
		
			
			this.threadContext.eval(sharedGlobalScope, "$server_global = Packages.info.emptybrain.myna.MynaThread;", sharedGlobalScope, "<eval>", false);
		
			String standardLibs = MynaThread.generalProperties.getProperty("standard_libs");
			
						
			if (standardLibs != null){
				String[] libPaths=standardLibs.split(",");
				URI sharedPath = new URI(this.rootDir).resolve("shared/js/"); 
				URI curUri;
				for (int x=0; x < libPaths.length;++x){
					curUri = new URI(libPaths[x]);
					if (!curUri.isAbsolute()){
						curUri = sharedPath.resolve(new URI(libPaths[x]));
					}
					boolean exists =false;
					try{exists=new File(curUri).exists();}catch(Exception e_exists){}
					if (!curUri.isAbsolute() || !exists){
						throw new IOException("Cannot find '" +libPaths[x] +"'  in system root directory or in '"+sharedPath.toString() +"'. See standard_libs in WEB-INF/classes/general.properties.");	
					}
					
					String scriptPath = curUri.toString();
					int lastSlash = scriptPath.lastIndexOf("/");
					this.currentDir = new URI(scriptPath.substring(0,lastSlash+1)).toString();
					String script = readScript(scriptPath);
					script = translateString(script,scriptPath); 
	                this.threadContext.eval(sharedGlobalScope, script, sharedGlobalScope, scriptPath, false);
					
				}
			}
			//sharedGlobalScope.seal();
			//sharedGlobalScope.freeze();

			
			return sharedGlobalScope;
		// } catch (Exception e){
		// 	System.err.println("========== compile errorr " + e);
		// 	this.handleError(e);
		// 	return sharedGlobalScope;
		} finally {
			this.currentDir = currentDir;
			this.currentScript = currentScript;
			this.scriptName = scriptName;
			this.requestScriptName = requestScriptName;
		}
		
	}
	public  ScriptObject buildScope() throws Exception{
		/*ScriptObject scope = ((GlobalObject)sharedGlobalScope).newObject();
		scope.setIsScope();
		scope.setProto(sharedGlobalScope);*/

		ScriptObject scope =threadContext.createGlobal();
		//scope.setProto((ScriptObject)sharedGlobalScope);		
		scope.put("Myna",ScriptUtils.wrap(sharedGlobalScope.get("Myna")),false);
		//scope.put("Number",ScriptUtils.wrap(sharedGlobalScope.get("Number")),false);
		//scope.put("Array",ScriptUtils.wrap(sharedGlobalScope.get("Array")),false);
		//scope.put("ObjectLib",ScriptUtils.wrap(sharedGlobalScope.get("ObjectLib")),false);
		//scope.put("Object",ScriptUtils.wrap(sharedGlobalScope.get("Object")),false);
		//scope.put("String",ScriptUtils.wrap(sharedGlobalScope.get("String")),false);
		//scope.put("Date",ScriptUtils.wrap(sharedGlobalScope.get("Date")),false);
		//scope.put("Function",ScriptUtils.wrap(sharedGlobalScope.get("Function")),false);
		//threadContext.eval(scope, "$server_global = Packages.info.emptybrain.myna.MynaThread;", scope, "<eval>", false);

		return scope;
		
	}
	
	
	/**
	* entry point for MynaThread
	* 
	*
	*/
	public void handleRequest (String scriptPath) throws Exception{
		
		runningThreads.add(this);
		MynaThread.currentThread.set(this);
		runtimeStats.put("threadId",this.toString());
		runtimeStats.put("started",this.started);
		
		int lastSlash = scriptPath.lastIndexOf("/");
		this.currentDir = new URI(scriptPath.substring(0,lastSlash+1)).toString();
		this.requestDir = this.currentDir;
		
		this.scriptName = scriptPath.substring(lastSlash+1);
		this.requestScriptName = this.scriptName; 
		synchronized (MynaThread.class){
			if (!isInitialized) {
				this.init();
				this.isInitThread=true;
				
			}
		}
		this.requestTimeout= Integer.parseInt(generalProperties.getProperty("request_timeout"));
		
		
		
		//reset currentDir after createing shared scope
		this.currentDir = new URI(scriptPath.substring(0,lastSlash+1)).toString();
		
		//System.out.println("globalScope = " + this.threadScope);
		
		URI sharedPath;
			
		//this means there was an error creating the scope, and we just need
		//to get out of the way and let the error display 
		
		
		
		
		threadScope = this.buildScope();
		this.threadContext.setGlobal(threadScope);
		//this.threadContext.load(this.threadScope,"nashorn:mozilla_compat.js");
		//this.threadContext.eval(threadScope, "$server_global = Packages.info.emptybrain.myna.MynaThread;", threadScope, "<eval>", false);
		threadScope.put("$server_gateway",this,false);

											
		runtimeStats.put("currentTask","Waiting in thread Queue");
		
		if (generalProperties.getProperty("thread_whitelist").length() > 0){
			String[] whitelist=generalProperties.getProperty("thread_whitelist").split(",");
			int x=0;
			for (;x<whitelist.length;++x){
				if (requestDir.matches(whitelist[x])) isWhiteListedThread=true;
			}
		}
		
		//wait if max threads are already running
		if (!isWhiteListedThread) {
			//generalProperties.getProperty("request_handler")
			boolean gotPermit =threadPermit.tryAcquire((long)requestTimeout,TimeUnit.SECONDS);
			if (!gotPermit) {
				throw new Exception(
					"Too Many Requests: Unable to leave request queue after "
					+requestTimeout+" seconds for url '" 
					+ ((StringBuffer)(environment.get("requestURL"))).toString()
				);
			}
		}
		try{	
			isWaiting=false;
			sharedPath = new URI(rootDir).resolve("shared/js/");
		
			//execute script file
			try{
				String requestHandler = generalProperties.getProperty("request_handler");
				URI requestHandlerPath = new URI(requestHandler);
				if (!requestHandlerPath.isAbsolute()){
					requestHandlerPath = sharedPath.resolve(requestHandlerPath);
				}
				if (!requestHandlerPath.isAbsolute() || !new File(requestHandlerPath).exists()){
					throw new IOException("Cannot find '" +requestHandlerPath +"' in system root directory or in '"+sharedPath.toString() +"'. See runtime_scripts in WEB-INF/classes/general.properties.");	
				}
				executeJsFile(threadScope, requestHandlerPath.toString());
				
			} catch (Exception e){
				handleError(e);
			}
		
		} catch (Exception e){
			handleError(e);
			
		} finally {
				//release our threadPermit
				releaseThreadPermit();
		}

		
		
	}
	
	public void releaseThreadPermit() {
		if (!isWhiteListedThread){
			threadPermit.release();
			//whitelist this thread to prevent double-release later
			isWhiteListedThread = true;
		}
		//remove this thread form the running list
		runningThreads.remove(this);
		MynaThread.currentThread.remove();
	}
	
	public void callFunction (String f,Object[] args) throws Exception{
		this.isWaiting =true;
		// runningThreads.add(this);
		// threadPermit.acquire();
		this.isWaiting =false;

		runtimeStats.put("threadId",this.toString());
		runtimeStats.put("started",this.started);
		this.requestTimeout= Integer.parseInt(generalProperties.getProperty("request_timeout"));
		
		
		
		this.environment.put("threadFunctionSource",f);
		this.environment.put("threadFunctionArguments",args);
		
		System.out.println(" callFunction: " + f);
	}
	/**
	* handles errors during JS execution
	*
	*/
	public void handleError(Throwable originalException) throws Exception{
		/* if (this.inError) return;*/
		this.inError = true;
		System.err.println("Error in :" +this.environment.get("requestURL") +":");
		//System.err.println(originalException);
		originalException.printStackTrace(System.err);
		
		try{
			if (!this.inError &&(originalException instanceof NashornException )){
				this.threadScope.put("exception", originalException,false);
				this.executeJsString(this.threadScope,"$application._onError(exception);","Compile Error");
			} else {
				StringBuffer errorText = new StringBuffer();
				
				errorText.append(originalException.getClass().getName() + ": ");
				errorText.append(originalException.getMessage() + "<br>");
				errorText.append("<p>Stack Trace:<br><pre>");
				
				StringWriter traceStringWriter = new StringWriter();
				PrintWriter tracePrintWriter = new PrintWriter(traceStringWriter);
				
				originalException.printStackTrace(tracePrintWriter);
				errorText.append(traceStringWriter.toString());
				errorText.append("</pre>");
				
				
				
				this.log("ERROR",originalException.getClass().getName() + ": "+ originalException.getMessage(),errorText.toString());
				if (generalProperties.getProperty("instance_purpose").toLowerCase().equals("dev")){
					this.generatedContent.append(errorText.toString());
				} else {
					this.generatedContent.append("An error has occurred. See administrator log for details.");
				}
				
			}
		} catch (Throwable newException){
			
			this.log("ERROR","Error parsing exception: " +newException.getClass().getName() + ": "+ newException.getMessage(),newException.toString());
				
			throw new Exception(originalException); //if there is a problem displaying the error, just rethrow the original error.	
		}
	}
	
	
	/**
	* Executes the supplied JavaScript.
	*
	*  
	* @param  scope Top level JavaScript scope
	* @param  script String containing the JavaScript code to execute
	* @param  scriptPath Filesystem path to the file containing script
	*/
	public void executeJsString(ScriptObject scope, String script, String scriptPath) throws Exception{
		Context cx = this.threadContext; 
		long start=0;
		long end=0;
		scriptPath = getNormalizedPath(scriptPath);
		start = new java.util.Date().getTime();
		ScriptFunction compiled;
		try {
			/*JCS cache = JCS.getInstance("scriptCache");
			//scriptPath =getNormalizedPath(scriptPath) 
			int key = script.hashCode();
			ScriptFunction compiled= (ScriptFunction) cache.get(key);
			
			script = translateString(script,scriptPath);
			this.currentScript = script;
			
			if (compiled == null){

				compiled = cx.compileScript(new Source(scriptPath, script), this.threadScope);
				//cache.put(key,compiled);
			}
			ScriptRuntime.apply(compiled,this.threadScope);*/
			//scope.setProto(this.threadScope);
			script = translateString(script,scriptPath);
			ScriptObject target = null;
			if (!scope.isScope()){
				target = scope;
				ScriptObject evalScope = ((GlobalObject)Context.getGlobal()).newObject();
				//System.out.println("----------------------------------------------------------------------");
				//System.out.println("Loading " + scriptPath + " scope " + scope.isScope());
				evalScope.setIsScope();
				evalScope.setProto(this.threadScope);
				jdk.nashorn.internal.objects.NativeObject.bindProperties(null,evalScope,scope);
				scope=evalScope;
				//System.err.println("Compiled " + scriptPath + " in eval scope");
				compiled = cx.compileScript(new Source(scriptPath, script+ "/*" + System.currentTimeMillis() +"*/"), scope);
			} else {
				//System.err.println("Compiled " + scriptPath + " in global scope");
				compiled = cx.compileScript(new Source(scriptPath, script), scope);
			}
			
			ScriptRuntime.apply(compiled,this.threadScope);
			//cx.eval(scope, script + "/*" + System.currentTimeMillis() +"*/", scope, scriptPath, false);
			if (target != null){//bind the created sope properties to the passed scope
				jdk.nashorn.internal.objects.NativeObject.bindProperties(null,target,scope);
			}

			
		} catch (Exception e){
			this.handleError(e);
		}
		
	}
	public ScriptObject createScope() throws Exception{
		ScriptObject evalScope = ((GlobalObject)Context.getGlobal()).newObject();
		evalScope.setIsScope();
		evalScope.setProto(this.threadScope);
		return evalScope;
	}
	void executeJsFile(ScriptObject scope, String scriptPath) throws Exception{
		File scriptFile;
		scriptPath = getNormalizedPath(scriptPath);
		JCS cache = JCS.getInstance("scriptCache");
		try {
			 scriptFile = new File(new URI(scriptPath));
		} catch (java.lang.IllegalArgumentException e){
			throw new java.lang.IllegalArgumentException("'" +scriptPath + "' is not a valid URI.");
		}
		
		try {
			if (cache.get(scriptPath) != null){
				IElementAttributes attributes = cache.getCacheElement(scriptPath).getElementAttributes();
				if ( scriptFile.lastModified() > attributes.getCreateTime()){
					cache.remove(scriptPath); //clear compiled copy when a newer version of the file is available 
				}
			}
		} catch (org.apache.jcs.access.exception.CacheException e){
			//assume cache exceptions mean it is unavailable	
		}
		String script = (String) cache.get(scriptPath); 
		if (script == null){
			script = readScript(scriptPath);

			//save to memory cache
			cache.put(scriptPath,script);

			
			int key = script.hashCode();
			ScriptFunction compiled;
			
			
			compiled = this.threadContext.compileScript(
				new Source(
					scriptPath, 
					translateString(script,scriptPath)
				), 
				this.threadScope
			);

			//cache.put(key,compiled);
			
		}
		executeJsString(scope, script, scriptPath);
	}

	void executeNashornFile(ScriptObject scope, String scriptPath) throws Exception{
		try{
		final PrintStream pout = new PrintStream(System.out);
        final PrintStream perr = new PrintStream(System.err);
        final PrintWriter wout = new PrintWriter(pout, true);
        final PrintWriter werr = new PrintWriter(perr, true);

        // Set up error handler.
        final ErrorManager errors = new ErrorManager(werr);
        final Options options = new Options("nashorn", werr);

       
        
      
        Context C =  new Context(options, errors, wout, werr, Thread.currentThread().getContextClassLoader());

        URL pathUrl = new URL(getNormalizedPath(scriptPath));
		String scriptCode =  org.apache.commons.io.FileUtils.readFileToString(new File(pathUrl.toURI()));

	
		try {
        	ScriptObject global = C.createGlobal();
        	C.setGlobal(global);

        	global.put("$server_gateway",this,false);
        	
        	

        	/*Object res;
            try {
                res = C.eval(global, scriptCode, global, null, false);
            } catch (final Exception e) {
                System.err.println(e);
                
                e.printStackTrace(System.err);
                
                
            }*/


        	Source source = new Source(scriptPath, pathUrl);
        	//System.out.println(source);
        	//System.out.println(global);
            final ScriptFunction script = C.compileScript(source, global);
            if (script == null || errors.getNumberOfErrors() != 0) {
                return;
            }

            try {
                 ScriptRuntime.apply(script, global);
            } catch (final NashornException e) {
                errors.error(e.toString());
                e.printStackTrace(C.getErr());
                return;
            }
            
        } finally {
            C.getOut().flush();
            C.getErr().flush();
        }		
	    } catch(Exception outer){
	    	StringBuffer errorText = new StringBuffer();
				
				errorText.append(outer.getClass().getName() + ": ");
				errorText.append(outer.getMessage() + "<br>");
				errorText.append("<p>Stack Trace:<br><pre>");
				
				StringWriter traceStringWriter = new StringWriter();
				PrintWriter tracePrintWriter = new PrintWriter(traceStringWriter);
				
				outer.printStackTrace(tracePrintWriter);
				errorText.append(traceStringWriter.toString());
				errorText.append("</pre>");

				System.out.print(errorText.toString());
	    }
		
	}
	
	/**
	* Escapes text so it can be safely inserted into a JS string literal. 
	*
	* @param  text text tot escape
	* @return  escaped text
	*/
	public String JSEscape(String text) {
		return text.replaceAll("\n","\\\\n")
			.replaceAll("'","\\\\'")
			.replaceAll("\"","\\\\\\\"");
	}
	
	/**
	* loads datasource settings into memory
	*
	*/
	public void loadDataSources() throws Exception{
		File dsDir = this.getNormalizedFile(MynaThread.generalProperties.getProperty("datasource_directory"));
		dsDir.mkdirs();  //make ds dir if necessary
		File[] dataSourcesPaths = dsDir.listFiles(new java.io.FileFilter(){
			public boolean accept(File path){
				String pathname = path.getName();
				return (path.getName().substring(pathname.length() -3).equals(".ds"));
			}
		});
		
		if (dataSourcesPaths != null){
			for (int x =0; x < dataSourcesPaths.length; ++x){
				try{
					loadDataSource(dataSourcesPaths[x],false);
				} catch (Exception e){
					handleError(e);
				} 
			}
		}
		
		
	}
	
	public void loadDataSource(File path, boolean shouldTest) throws Exception{
		String dsName = path.getName().substring(0,path.getName().length() -3).toLowerCase();
		//try{
			Properties ds = new Properties();
			ds.load(new java.io.FileInputStream(path));
			
			if (ds.getProperty("url") == null || ds.getProperty("url").length() == 0) {
				throw new Exception("No url defined for DataSource " + dsName);
			}
			if (ds.getProperty("driver") == null || ds.getProperty("driver").length() == 0) {
				throw new Exception("No driver for DataSource " + dsName);
			}
			dataSources.put(dsName,ds);
			
      /* special handling of file paths */
			if (
				!ds.getProperty("type").equals("other") 
				&& ds.getProperty("location").equals("file")
				&& ds.getProperty("file") != null
			){
				boolean exists = false;
				try{
					exists=new File(ds.getProperty("file")).exists();
				} catch(Exception e_exists){
				}
				if (!exists){
					String newPath = getNormalizedPath(ds.getProperty("file"))
						.replaceAll("file:","").replaceAll("//","/").replaceAll("%20"," ");
						
					ds.setProperty("url",
						ds.getProperty("url").replaceAll(
							ds.getProperty("file"),
							newPath 
						)
					);
				}
			}
			//register connection pool
			
			GenericObjectPool connectionPool = new GenericObjectPool(null);
			ConnectionFactory connectionFactory = new DriverManagerConnectionFactory(
				ds.getProperty("url"), 
				ds.getProperty("username"),
				ds.getProperty("password")
			);
			PoolableConnectionFactory poolableConnectionFactory = new PoolableConnectionFactory(connectionFactory,connectionPool,null,null,false,true);
			PoolingDriver driver = new PoolingDriver();
			driver.setAccessToUnderlyingConnectionAllowed(true);
			
			driver.registerPool(dsName,connectionPool);
			Class.forName(ds.getProperty("driver"));
			if (shouldTest) {
				//this line should trigger an error if the datsource is incorrect or unavailable
				java.sql.DriverManager.getConnection("jdbc:apache:commons:dbcp:" + dsName).close();
			}
			
			BasicDataSource bds = new BasicDataSource();
			bds.setDriverClassName(ds.getProperty("driver"));
			bds.setUsername(ds.getProperty("username"));
			bds.setPassword(ds.getProperty("password"));
			bds.setUrl(ds.getProperty("url"));
			this.javaDataSources.put(dsName,bds);

			
		/*} catch(Exception e){
			this.log("ERROR","Error Loading Datasource " + dsName +": " +e.getMessage(),e.toString());
			
			//throw new Exception("Error loading Datasource '" + dsName +"' : '" + e.getMessage() + "'");	
		}*/
	}
	
	/**
	* loads general settings into memory
	*
	*/
	public void loadGeneralProperties() throws Exception{
		Properties version = new Properties();
		version.load(getClass().getResourceAsStream("/version.properties"));
		MynaThread.version = version.getProperty("version");
			
		this.generalProperties.load(getClass().getResourceAsStream("/general.properties"));
		boolean propsChanged = false;
		
		//set defaults for properties not in previous releases
		if (generalProperties.getProperty("max_running_threads") == null){
			generalProperties.setProperty("max_running_threads","5");
			propsChanged=true;
		}
		if (generalProperties.getProperty("background_thread_pool") == null){
			generalProperties.setProperty("background_thread_pool","5");
			propsChanged=true;
		}
		if (generalProperties.getProperty("request_timeout") == null){
			generalProperties.setProperty("request_timeout","30");
			propsChanged=true;
		}
		if (generalProperties.getProperty("thread_history_size") == null){
			generalProperties.setProperty("thread_history_size","20");
			propsChanged=true;
		}
		if (generalProperties.getProperty("thread_whitelist") == null){
			generalProperties.setProperty("thread_whitelist",".*/myna/administrator/.*");
			propsChanged=true;
		}
		if (generalProperties.getProperty("smtp_host") == null){
			generalProperties.setProperty("smtp_host","localhost");
			propsChanged=true;
		}
		if (generalProperties.getProperty("server_start_scripts") == null){
			generalProperties.setProperty("server_start_scripts","libOO/server_start.sjs");
			propsChanged=true;
		}
		if (generalProperties.getProperty("version") == null 
			|| !generalProperties.getProperty("version").equals(MynaThread.version)){
			generalProperties.setProperty("version",this.version);
			propsChanged=true;
		}
		if (generalProperties.getProperty("request_handler") == null){
			generalProperties.setProperty("request_handler","libOO/request_handler.sjs");
			propsChanged=true;
		}
		if (generalProperties.getProperty("instance_id") == null){
			generalProperties.setProperty("instance_id","myna_instance");
			propsChanged=true;
		}
		if (generalProperties.getProperty("instance_purpose") == null){
			generalProperties.setProperty("instance_purpose","DEV");
			propsChanged=true;
		}
		if (generalProperties.getProperty("administrator_email") == null){
			generalProperties.setProperty("administrator_email","");
			propsChanged=true;
		}
		if (generalProperties.getProperty("administrator_email_on_error") == null){
			generalProperties.setProperty("administrator_email_on_error","0");
			propsChanged=true;
		}
		if (generalProperties.getProperty("enable_directory_listings") == null){
			generalProperties.setProperty("enable_directory_listings","1");
			propsChanged=true;
		}
		
		if (generalProperties.getProperty("commonjs_paths") == null){
			generalProperties.setProperty("commonjs_paths","/shared/js/commonjs/,/shared/js/narwhal/engines/rhino/lib,/shared/js/narwhal/engines/default/lib,/shared/js/narwhal/lib/,/");
			propsChanged=true;
		}
		if (generalProperties.getProperty("debug_parser_output") == null){
			generalProperties.setProperty("debug_parser_output","0");
			propsChanged=true;
		}
		if (generalProperties.getProperty("cron_tasks_via_mynacmd") == null){
			generalProperties.setProperty("cron_tasks_via_mynacmd","1");
			propsChanged=true;
		}
		if (generalProperties.getProperty("log_engine") == null){
			generalProperties.setProperty("log_engine","myna_log");
			propsChanged=true;
		}

		if (generalProperties.getProperty("timeout_ic_threshold") == null){
			generalProperties.setProperty("timeout_ic_threshold","10000");
			propsChanged=true;
		}

		

		if (propsChanged) saveGeneralProperties();
	}
	
	/**
	* writes a a simplified log entry from java. 
	*
	* @param type String type
	* @param label String label
	* @param detail String detail
	*/
	public void log(
			String type,
			String label,
			String detail
	) throws Exception{
		
		String requestId = "system";
		String appName = "system";
		
		int logElapsed = 0;
		long requestElapsed = System.currentTimeMillis() - this.started.getTime();
		
		java.sql.Timestamp eventTs = new java.sql.Timestamp(new java.util.Date().getTime());

		if (!this.inError && this.threadScope != null){
			try{
			ScriptObject myna = (ScriptObject)this.threadScope.get("Myna");

			ScriptFunction fct = (ScriptFunction)myna.get("log");
			ScriptRuntime.apply(
				fct,
        		this.threadScope,
        		new Object[] {
        			type,
        			label,
        			detail
        		});
			} catch (Exception e){
				this.writeLog(type,label,detail,appName,requestId,requestElapsed,logElapsed,eventTs);
				
			}
		} else {
			this.writeLog(type,label,detail,appName,requestId,requestElapsed,logElapsed,eventTs);
			
		}
	}
	
	/**
	* writes a message to myna_log, or standard out if DB is unavailable
	*
	* @param type String type
	* @param label String label
	* @param detail String detail
	* @param appName String appName
	* @param requestId String requestId
	* @param logElapsed int logElapsed
	*/
	public void writeLog(
			String type,
			String label,
			String detail,
			String appName,
			String requestId,
			long requestElapsed,
			int logElapsed,
			java.util.Date eventTs
	) throws Exception{
		String purpose = generalProperties.getProperty("instance_purpose");
		String logId = org.safehaus.uuid.UUIDGenerator.getInstance().generateRandomBasedUUID().toString();
		String instanceId = this.generalProperties.getProperty("instance_id");
		String hostname = java.net.InetAddress.getLocalHost().getHostName();
		System.err.println(hostname +"/"+ instanceId + ": [" + type +"] " + label );
		System.err.println(detail);	
	}
	
	/**
	* saves general settings into disk
	*
	*/
	public void saveGeneralProperties() throws Exception{
		String path;
		try {
			path =getClass().getClassLoader().getResource("/general.properties").toString();
		} catch (NullPointerException np){
			path =getNormalizedPath("/WEB-INF/classes/general.properties");
		}
		URI uri = new URI(path);
		
		this.generalProperties.store(new java.io.FileOutputStream(new File(uri)),"Myna General Properties");
	}
	
	/**
	* Read text content from supplied absolute Filesystem path and returns Serverside JavaScript text.
	*
	*
	* @param  scriptPath Path to script to read
	* @return  Serverside JavaScript text. If the filename ends in .ejs, content is filtered through parseEmbeddedJs.
	* @see #parseEmbeddedJs(String content)
	*/
	public String readScript(String scriptPath) throws Exception{
		return org.apache.commons.io.FileUtils.readFileToString(new File(new URI(scriptPath)));
		//if (true) throw new Exception(scriptPath );	
		/* FileInputStream fis = new FileInputStream(new File(new URI(scriptPath)));
		int x= fis.available();
		byte b[]= new byte[x];
		fis.read(b);
		String script = new String(b);
		fis.close(); 
		
		 
		return  script;*/
	}
	
	
	public void sealObject(Object obj){
		
	}
	
	
	/**
	* loads and evaluates the supplied ejs or sjs file in the current context
	*
	* @param  scriptPath sjs or ejs file to include
	*/
	public void include(String scriptPath) throws Exception{
		include(scriptPath,this.threadScope);
	}
	
	public void include(String scriptPath, ScriptObject scope) throws Exception{
		String originalDir = this.currentDir;
		String originalScriptName = this.scriptName;
		
		String realScriptPath = getNormalizedPath(scriptPath);
		int lastSlash = realScriptPath.lastIndexOf("/");
		
		this.currentDir = realScriptPath.substring(0,lastSlash+1);
		this.scriptName = realScriptPath.substring(lastSlash+1);
		
		this.executeJsFile(scope,realScriptPath);
		
		
		
		this.currentDir = originalDir ;
		this.scriptName = originalScriptName;
		
	}
	/**
	* loads and evaluates the supplied ejs or sjs file in the current context, 
	* not already included before. Usually for function/object libraries.
	*
	* @param  scriptPath sjs or ejs file to include 
	*/
	public void includeOnce(String scriptPath) throws Exception{
		includeOnce(scriptPath,this.threadScope);
		
	}
	
	public void includeOnce(String scriptPath, ScriptObject scope) throws Exception{
		String realPath = getNormalizedPath(scriptPath); 
		
		if (uniqueIncludes_.add(realPath)){
			include(realPath,scope);	
		}
	}
	
	/**
	* if the filename appears to be an absolute path, it is simply returned, otherwise it is 
	* assumed to be path relative to the directory of the calling script.    
	*
	* @param  url  an absolute URL giving the base location of the image
	* @return      full filessystem path to the requested file
	*/
	private String expandPath(String fileName){
		
		if (new File(fileName).isAbsolute() ){ //if this is not an absolute path
			return new String(fileName);
		} else{
			return  new String(this.currentDir + fileName);
		}
	}
	
	public File getNormalizedFile(String path) throws Exception{
		return new File(new URI(getNormalizedPath(path)));
	}
	
	public String getNormalizedPath(String path) throws Exception{
		//try to URLencode any weird parts
		if (path.indexOf("%") == -1){
			String[] parts =path.split("/");
			StringBuffer uriString= new StringBuffer();
			int x=0;
			path = path.replaceAll(":","___MYNA_COLON___");
			path = path.replaceAll("/","___MYNA_SLASH___");
			path = path.replaceAll(" ","___MYNA_SPACE___");
			path = java.net.URLEncoder.encode(path,"utf-8");
			path = path.replaceAll("___MYNA_SPACE___","%20");
			path = path.replaceAll("___MYNA_COLON___",":");
			path = path.replaceAll("___MYNA_SLASH___","/");
		}
		URI uri = new URI(path);
		
		URI	rootUri = new URI(this.rootDir);
		if (this.currentDir == null) this.currentDir = this.rootDir;
		URI	currentUri = new URI(this.currentDir);
		
		if (!uri.isAbsolute() ){ //if this is  an absolute path, i.e. starts with "file://"
			if (path.charAt(0) == '/'){ //paths that start with slash mean the rootDir
				uri =  rootUri.resolve(path.substring(1)).normalize();
			} else { //all other paths are  relative to the current directory 
				uri = currentUri.resolve(uri).normalize();
			}
		}
		
		return uri.toString();
	}
	
	public Semaphore getLock(String name) throws Exception{
		manageLocksPermit.acquire();
		try{
			Semaphore lock = (Semaphore) locks.get(name);
			if (lock == null) locks.put(name, new Semaphore(1,true));
			lock.acquire();
			return lock;
		} finally{
			manageLocksPermit.release();
		}
		
	}
	
	/** 
	* A pre-processor to convert embedded JavaScript (.ejs) and <ejs> blocks into Serverside JavaScript (.sjs) 
	*
	* @param  content  String content to translate
	* @param  scriptPath URI where content was retrieved. used in errors, and for determining content type 
	* @return  translated content
	*/
	public String translateString(String content, String scriptPath) throws Exception{
		MynaEjsParser parser = new MynaEjsParser();
		String translated = parser.parseString(content,scriptPath);

		translatedSources.put(scriptPath,translated);		
		//log("TRANSLATED",scriptPath,translated);
		
		return translated;
	}
	
	
	
	
	public Object spawn(String func, Object[] args) throws Exception{
		MynaThread mt = buildBackgroundThread(func,args);
		mt.environment.put("RequestThread", true);
		
		Thread thread = new Thread(mt);
		Hashtable retval = new Hashtable();
		
		thread.start();
		
		retval.put("javaThread",thread);
		retval.put("mynaThread",mt);
		return retval;
	}
	public MynaThread buildBackgroundThread(String func, Object[] args) throws Exception{
		MynaThread mt = new MynaThread();
		mt.environment.put("threadFunctionSource", func);
		mt.environment.put("threadFunctionArguments", new Vector(java.util.Arrays.asList(args)));
		mt.environment.put("RequestThread", false);
		mt.rootDir = rootDir;
		mt.rootUrl =rootUrl;
		mt.currentDir =currentDir;
		mt.requestDir =requestDir;
		mt.scriptName =scriptName;
		mt.requestScriptName =requestScriptName; 
		mt.threadChain = new Vector(threadChain);
		mt.threadChain.add(func);	
		
		if (mt.threadChain.size() > 5){
			log("ERROR","thread chains cannot descend more than 5 levels.","Thread Chain:<br> " +this.threadChain);
			throw new Exception("thread chains cannot descend more than 5 levels.");
		} //else {System.err.println("\n\nthis.threadChain="+this.threadChain);}
		
		return mt;
	}
   
	public void run (){
		try {
			String f = (String) environment.get("threadFunctionSource");
			Object [] args = ((Vector)(environment.get("threadFunctionArguments"))).toArray();
			//System.out.println("thread size=" + this.threadChain.size() +" function:"  + f.substring(0,25));		
			if ((Boolean) environment.get("RequestThread") == true) {
				this.isWaiting =true;	
				runningThreads.add(this);
				MynaThread.currentThread.set(this);
				threadPermit.acquire();
				this.isWaiting =false;	
			}
			
			callFunction(f,args);
		} catch (Exception e){
			try {
				handleError(e);
			} catch (Exception e2){
				java.lang.System.err.println(e2);	
			}
		}finally{
			if ((Boolean) environment.get("RequestThread") == true) releaseThreadPermit();
		}
	}
   
	


}
