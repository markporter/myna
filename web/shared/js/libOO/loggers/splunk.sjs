/* Topic: Loggers/splunk/logger.sjs 
    The Splunk logger writes to a file called myna_HOSTNAME_INSTANCEID_Y-m-d.log in the same directroy as the Splunk Console log. This is a json format that should be parsed automatically by Splunk
*/

/* Function: log
	Logs to splunk compatible log in same directory as 
	*/
	function log(data){
        var mynaLog = new Myna.File(new java.io.File(java.lang.System.getProperty("logFile")).toURI());
        var logFileDir = mynaLog.getDirectory()
        var logFile = new Myna.File(
            logFileDir,
            "myna_{0}_{1}_{2}.log".format(
                $server.hostName,$server.instance_id,
                new Date().format("Y-m-d")
            )
        );
		data.checkRequired(["log_id"]);
		data.setDefaultProperties({
			type:"debug",
			label:"",
			detail:"",
			app_name:"",
			event_ts:new Date(),
			hostname:$server.hostname,
			instance_id:$server.instance_id,
			log_elapsed:"",
			purpose:$server.purpose,
			request_elapsed:"",
			request_id:$server.request_id
		})
		data.detail = data.detail
			.replace(/\n/g,"_RET_")
			.replace(/<script>.*?<\/script>/,"")
			.replace(/<style>.*?<\/style>/,"")
			.replace(/<\/?[^>]+>/g," ")
            .replace(/&#\d+;/g," ")
            .replace(/<\/?tr\/?>/g,"\n")
			.replace(/<\/?br\/?>/g,"\n")
			.replace(/<\/?br\/?>/g,"\n\n")
            .replace(/&nbsp;/g," ")
            
			.replace(/_RET_/g,"\n")
        data.event_ts=data.event_ts.format("Y-m-d H:i:s")
        logFile.appendString(data.toJson()+"\n");
	}