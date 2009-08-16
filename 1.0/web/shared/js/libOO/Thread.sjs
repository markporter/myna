/* 
	Class: Myna.Thread
		Executes code in a separate thread
	
		
*/
if (!Myna) var Myna={}

/* Constructor: Thread
	Constructor function for Thread class
	
	Parameters:
		f			-	function to execute
		args		-	*Optional, default []*
						array of arguments to pass to the function;
		priority	-	*Optional, default 0*
						This integer represents how often this thread should be 
						scheduled as a percentage of normal priority. For 
						example, priority 20 would be 20% more likely to run 
						than normal requests  during a given time slice. 
						Priority -10 would be 10% LESS likely than normal 
						requests to run during a given time slice 
	
	Detail:
		Executes _f_ in a separate thread. This can be used to take advantage of 
		multiple processors be splitting a long running task into multiple 
		functions running in parallel, or to execute non-interactive code in the 
		background.
		
	Warning:
		Threads cannot be created recursively. If a Thread attempts to call the same
		function as the body of any parent Thread, executions is silently 
		terminated. This prevents infinite Thread spawning.   
		
	Returns:
		Reference to Thread instance
*/
Myna.Thread=function(f,args,priority){
	
	if (!("__MYNA_THREADS__" in $req)) $req.__MYNA_THREADS__=[];
	
	
	
	var parent = this;
	this.functionSource = f.toSource();
	
	
	/* Property: javaThread
		a local instance of java.lang.Thread
	*/
	this.javaThread=$server_gateway.spawn(f,args);
	if (this.javaThread){
		var p = java.lang.Thread.NORM_PRIORITY;
		if (priority > 0){
			p += (priority/100) * (java.lang.Thread.MAX_PRIORITY - p);
		} else if (priority < 0){
			p += (priority/100) * (p - java.lang.Thread.MIN_PRIORITY);
		}
		this.javaThread.setPriority(p)
		$req.__MYNA_THREADS__.push(this);
	}
	 
}

/* Function: join
	Pauses the current thread until this thread exits, and then returns thread function result
	
	Returns:
		return value of thread function
	
	Parameters:
		timeout			-	*Optional, default 300000 (30 seconds)*
								time in milliseconds to wait for the thread to finish. 
								If the thread has not finished before the timeout 
								control is returned to the current thread
		throwOnTimeout	-	*Optional, default true*
								If the thread has not finished before the timeout, 
								throw an Error.
*/
Myna.Thread.prototype.join=function(timeout,throwOnTimeout){
	var $this = this;
	if (throwOnTimeout === undefined) throwOnTimeout=true;
	if (!timeout) timeout = 30*1000; //30 seconds
	if (this.javaThread.isAlive()){
		this.javaThread.join(timeout);
		if (this.javaThread.isAlive()){
			if (throwOnTimeout){
				Myna.log("error","Thread ("+this.javaThread.toString()+") Timeout detail", this.functionSource);
				throw new Error("Thread ("+this.javaThread.toString()+") still running after "+timeout+" miliseconds. See log for thread detail.")	
			} else return undefined 
		} else return threadValue();
	} else return threadValue();
	
	function threadValue(){
		var threadId = $this.javaThread.getName();
		var subThread = $server_gateway.environment.get("subthread_" + threadId);
		var result = subThread.environment.get("threadReturn");
		return result
	}
}


/* Function: isRunning
	returns true if this thread is still running
*/
Myna.Thread.prototype.isRunning=function(){
	return this.javaThread.isAlive();
}

/* Function: getContent
	returns content generated by this thread
	
	Don't expect to see anything while <isRunning> returns true
*/
Myna.Thread.prototype.getContent=function(){
	var threadId = this.javaThread.getName();
	var subThread = $server_gateway.environment.get("subthread_" + threadId);
	return String(subThread.generatedContent)	
}

/* Function: getReturnValue
	returns the value returned by the thread function.
	
	Don't expect to see anything while <isRunning> returns true
*/
Myna.Thread.prototype.getContent=function(){
	var threadId = this.javaThread.getName();
	var subThread = $server_gateway.environment.get("subthread_" + threadId);
	var result = subThread.environment.get("threadReturn");
	return result;
}


/* Function: stop
	stops this thread.
*/
Myna.Thread.prototype.stop=function(){
	return this.javaThread.interrupt();
}

/* Function: kill
	kills this thread.
*/
Myna.Thread.prototype.kill=function(){
	return this.javaThread.stop();
}
/* Function: joinAll 
	Static function that calls <join> on all threads spawned from the current 
	thread, and returns an array of their return values
	
	Example:
	(code)
	(10).times(function(i){
		new Myna.Thread(function(i){
			return i;
		},[i])
	})
	Myna.printDump(Myna.Thread.joinAll())
	(end)
*/
Myna.Thread.joinAll = function(){
	return $req.__MYNA_THREADS__.map(function(t){
		return t.join();
	})	
}