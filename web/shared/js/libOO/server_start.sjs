//only if not running from commandline
$server_gateway.environment.put("threadName","Server Start Thread");
if (!$server_gateway.environment.containsKey("isCommandline")){
	/* clean ds cache */
		Myna.printConsole("Flushing Datasource Class Cache...");
		new Myna.File("/WEB-INF/myna/ds_class_cache").forceDelete()
	/* if (Packages.bootstrap.MynaServer.server){
		new Myna.Thread(function(){
			$req.timeout=0;
			var loopCount=0;
			var lowMemCount=0;
			$profiler.mark("Server health monitor thread")
			Myna.sleep(10000);//lets give the server some time to get going
			while(true){
				Myna.sleep(1000);
				++loopCount;
				java.lang.Runtime.getRuntime().gc();
				var memFree = $server.memAvailable/$server.memMax;
				var runningThreads = $server_gateway.runningThreads.toArray().length;
				if (memFree < .015){
					++lowMemCount;
					
					java.lang.Runtime.getRuntime().gc();
					if (lowMemCount >1){
						Myna.printConsole(" Less than 15% free memory, restarting...");
						Myna.printConsole(
							"Running Threads",
							"Mem Used: " +($server.memUsed/(1024*1024)).toFixed(2) +"MB, "+ (memFree*100).toFixed(2) + "% Free. Running threads: " + runningThreads
						)
						
						$server_gateway.runningThreads.toArray()
						.map(function(thread){
							var scope = thread.threadScope
							var current_task="";
							var url;
							var req = thread.environment.get("request");
							var runtime=new Date().getTime() - thread.started.getTime();
							var current_runtime=runtime;
							if (req){
								url=req.getRequestURI();
							} else {
								url="Thread in " +thread.getNormalizedPath(thread.requestDir);
							} 
							
							if (thread.isWaiting){
								current_task="Queued";
							} else if (scope.$profiler){
								try {
									var times = scope.$profiler.times;
									var time = times[times.length-1];
									current_task=time.label||"";
								} catch(e){}
							}
							Myna.printConsole(<ejs>
								<%=url.toFixedWidth(60)%> <%=current_task.toFixedWidth(60)%> <%=Date.formatInterval(runtime)%>
							</ejs>)
							
						})
						
						
						$server.restart()
					}
				} else {
					lowMemCount=0;	
				}
				if (loopCount==1000) loopCount=0;
			}
		},[],.99)
	} */
	$req.timeout=0;
	Myna.printConsole("Check/upgrade Myna datasources and tables...");
	Myna.include("/shared/js/libOO/upgrade_tables.sjs",{});
	
	
	/* add connection testing to datasources */
	Myna.printConsole("Load datasources and add health checks...");
	var keys = Myna.JavaUtils.enumToArray(Packages.info.emptybrain.myna.MynaThread.javaDataSources.keys());
	var dbTypes = {}
	var files = new Myna.File("/shared/js/libOO/db_properties/").listFiles("sjs")


	new Myna.File("/shared/js/libOO/db_properties/").listFiles("sjs").forEach(function(file){
		dbTypes[file.fileName.listFirst(".")] = Myna.include(file.toString(),{})
	})
	keys.forEach(function(dsName){
		  var bds = Packages.info.emptybrain.myna.MynaThread.javaDataSources.get(dsName);
		  var ds = Myna.JavaUtils.mapToObject(Packages.info.emptybrain.myna.MynaThread.dataSources.get(dsName));
		  var file = new Myna.File("/WEB-INF/myna/ds/" + ds.type);
		
		  if (ds.type in dbTypes &&
					 "connectionTestSql" in dbTypes[ds.type]
		  ) {
			 bds.setTestOnBorrow(true);
			 bds.setValidationQuery(dbTypes[ds.type].connectionTestSql);
		  }
	})

	//set up the commandline Script
		Myna.printConsole("Building commandline script...");
		var props = Myna.JavaUtils.mapToObject(java.lang.System.properties);
		var mynaCmd
		if (/windows/i.test($server.osName)){
			mynaCmd =new Myna.File("/WEB-INF/myna/commandline/myna.cmd");
			
			mynaCmd.writeString(<ejs>
				@echo off
				REM this is max memory to use. 
				set MEM=128
				
				set JAVA=<%=props["java.home"]%>\bin\java.exe
				set WEB_INF=<%=new Myna.File("/WEB-INF").javaFile.toString()%>
				
				"%JAVA%" -Xmx%MEM%m -cp "%WEB_INF%\lib\*;%WEB_INF%\classes" info.emptybrain.myna.JsCmd "%~1" "%~2"  "%~3"  "%~4"  "%~5"  "%~6"  "%~7" "%~8" "%~9" 	
			</ejs>)
			//Myna.log("info","Created Myna Commandline script in " + mynaCmd.javaFile.toString(),Myna.dump(result));
		} else {
			mynaCmd =new Myna.File("/WEB-INF/myna/commandline/myna");
			
			mynaCmd.writeString(<ejs>
				#!/bin/bash
				
				#this is max memory to use. Can be overridden with the -m option 
				MEM=128
				
				JAVA="<%=props["java.home"]%>/bin/java"
				PATH="$PATH;<%=props["java.home"]%>/bin"
				WEB_INF="<%=new Myna.File("/WEB-INF").javaFile.toString()%>"
				
				if [ $# -eq 0  ] || [ $1 == "--help" ]; then
					echo
					echo USAGE:
					echo $0 [-m max_JVM_memory] filename arg1 arg2 argN...
					echo
					exit 1
				fi

				if [ $1 == "-m" ]; then
					shift
					MEM=$1
					shift
				fi
				
								
				java -DINST=MynaCmd -DSCRIPT=$1 -Xmx${MEM}m -cp $WEB_INF/lib/*:$WEB_INF/classes/ info.emptybrain.myna.JsCmd ${1+"$@"}	
			</ejs>); // */
			var result =Myna.executeShell("/bin/bash",<ejs>
				/bin/chmod 777 <%=mynaCmd.javaFile.toString()%>
			</ejs>)
			Myna.printConsole("Created Myna Commandline script in " + mynaCmd.javaFile.toString());
			//Myna.log("info","Created Myna Commandline script in " + mynaCmd.javaFile.toString(),Myna.dump(result));
		}
	
	//reload cron
		/*Myna.printConsole("Loading scheduled tasks...");
		Myna.Admin.task.scheduleNextRun();
		var cronThread = new java.util.Timer();
		cronThread.schedule(
			new Packages.info.emptybrain.myna.CronTimerTask(),
			10,
			Date.getInterval(Date.SECOND,10)
		)*/
	
	
	
	
	
}
