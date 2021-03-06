/*global
	$req:true
	$server:false
	Myna:false
	Packages
	$application
*/
/*jshint es5:true*/

/* Class: $cookie
	A global object for interacting with cookies in the current request
*/
var $cookie={
	/* Property: data
		Array of javax.servlet.http.Cookie objects sent in this request.
		
	*/
	get data(){
		if ($server.request){
			return $server.request.getCookies() || []
		} else return []
	},
	
	/* Function: get
		returns the value of the named cookie.
		
		Parameters:
			name - Name of cookie to retrieve
		
		Returns:	
			The value of the named cookie or null if not defined.
	*/
	get:function(name){
		if ("_PENDING_COOKIES_" in $req && name in $req._PENDING_COOKIES_) {
			return   $req._PENDING_COOKIES_[name]
		}
		var cookieArray = $cookie.data;
		for (var x=0; x < cookieArray.length; ++x){
			if (cookieArray[x].getName().toLowerCase() == name.toLowerCase()){
				return cookieArray[x].getValue();
			}
		}
		
		return null;
	},
	/* Function: set
		sets a cookie
		
		Parameters:
			name	- Name of cookie to set
			value	- String value of cookie
			options	- *Optional* JavaScript Object of extra optional parameters. See below:
		
		Options:
			domain			-	*Default null* 
								Domain to share the cookie with. If set, 
								the browser will send this cookie to any page in this domain
								or sub domains that matches path. Must start with a dot, 
								e,g, ".mynjs.org"
								
			path			-	*Default null*
								Start path of page that the cookie should be sent to.
								
			expireSeconds	-	*Default -1* 
								An integer specifying the maximum age of the cookie 
								in seconds; if negative, means the cookie is not stored; if zero, 
								deletes the cookie
								
			httpOnly		-	*Default true*
								Should this cookie be invisible to browser JavaScript?

			secure			-	*Default false*
								Should this cookie only be sent via SSL?
		Returns:	
			_value_

		See:
		* https://www.owasp.org/index.php/HttpOnly

	*/
	set:function(name,value,options){
		if (!$server.response ) return undefined; //don't bother if we can't send cookies
		
		if (options === undefined) options ={}
		options.setDefaultProperties({
			domain:null,
			expireSeconds:-1,	//an integer specifying the maximum age of the cookie in seconds; if negative, means the cookie is not stored; if zero, deletes the cookie
			path:null,
			secure:false,
			httpOnly:true
		})
		
		var cookie = new Packages.javax.servlet.http.Cookie(name,value);
		cookie.setMaxAge(options.expireSeconds);
		if (options.domain !== null) cookie.setDomain(options.domain);
		if (options.path !== null) cookie.setPath(options.path);
		cookie.setHttpOnly(!!options.httpOnly);
		cookie.setSecure(!!options.secure);
		
		$server.response.addCookie(cookie);
		if (!("_PENDING_COOKIES_" in $req)) $req._PENDING_COOKIES_ ={}
		$req._PENDING_COOKIES_[name] = value;
		
		return value
	},
	/* Function: setAuthUserId
		sets a cookie that contains the supplied user_id and a timestamp
		
		Parameters:
			user_id	- user_id of the user to track
								
		Returns:	
			void
			
		Detail:
			This function sets an encrypted cookie "myna_auth_cookie" that 
			contains the supplied user_id.  Once set, this cookie will be 
			refreshed on every request until cleared with 
			<$cookie.clearAuthUserId>. 
			
			This functionality can bee used as an alternative to sessions. 
			
			To access the contents of this cookie, call <$cookie.getAuthUser>, 
			which will return the result of <Myna.Permissions.getUserById> for 
			the user_id in the cookie, or null if there is no cookie. 
			
	*/
	setAuthUserId:function(user_id,cookieOptions){
		if (!cookieOptions) cookieOptions={};
		if (!cookieOptions.path) cookieOptions.path=$application.url;

		$cookie.__AUTH_USER_ID__ = user_id;
		var cookie_data=Myna.Permissions.getAuthToken(
			user_id,
			Date.getInterval(Date.DAY,1)/1000
		)
		/*{
			user_id:user_id,
			ts:new Date().getTime()
		}.toJson()
		.encrypt(Myna.Permissions.getAuthKey("myna_auth_cookie"))*/
		
		$cookie.set("myna_auth_cookie",cookie_data,cookieOptions);
		if ($req.data.auth_provider) {
			this.setAuthProvider($req.data.auth_provider);
		}
		$cookie.__authCleared = false;
	},
	/* Function: setAuthProvider
		sets a cookie (myna_last_provider) that contains the last AuthAdapter used by this user for this application
		
		Parameters:
			auth_type	- provider name that this user should be re-authenticated with
								
		Returns:	
			void
			
		Detail:
			this is a plain text AuthType name that can be used with <Myna.Permissions.getAuthAdapter> 
			
	*/
	setAuthProvider:function(auth_type,cookieOptions){
		if (!cookieOptions) cookieOptions={};
		if (!cookieOptions.path) cookieOptions.path=$application.url;
		if (!cookieOptions.expireSeconds) cookieOptions.expireSeconds=Date.getInterval(Date.DAY,1)/1000
		$cookie.set("myna_last_provider",auth_type,cookieOptions);
	},
	/* Function: clearAuthUserId
		Clears the "myna_auth_cookie". Equivalent to 
		$cookie.clear("myna_auth_cookie")
			
		Returns:	
			void
	*/
	clearAuthUserId:function(){
		$cookie.clear("myna_auth_cookie",$application.url);
		delete $cookie.__AUTH_USER_ID__
		$cookie.__authCleared = true;
	},
	/* Function: getAuthUserId
		Returns the user_id in "myna_auth_cookie", or null if there is no 
		cookie
			
		Returns:	
			void
	*/
	getAuthUserId:function(){
		if ($cookie.__authCleared) return null;
		
		if ("__AUTH_USER_ID__" in $cookie) return $cookie.__AUTH_USER_ID__;
		
		var cookie = $cookie.get("myna_auth_cookie");
		if (cookie){
			/*try {
				var key = Myna.Permissions.getAuthKey("myna_auth_cookie")
				var auth_data = cookie
				.decrypt(key)
				.parseJson();
				$cookie.__AUTH_USER_ID__ = auth_data.user_id;
			} catch (e){
				$cookie.__AUTH_USER_ID__ = null;
				Myna.logSync("info","myna_auth_cookie decryption failed",
					"cookie = '"+cookie+"'<hr>" + Myna.formatError(e));
				
			}*/
			$cookie.__AUTH_USER_ID__ = Myna.Permissions.readAuthToken(cookie);
			if (!$cookie.__AUTH_USER_ID__){
				Myna.logSync(
					"info",
					"myna_auth_cookie token is invalid or expired.",
					"token = '"+cookie+"'"
				);
			}
		} else {
			$cookie.__AUTH_USER_ID__ = null;
		}
		return $cookie.__AUTH_USER_ID__;
	},
	/* Function: getAuthUser
		Return the result of <Myna.Permissions.getUserById> for the user_id in 
		"myna_auth_cookie", or null if there is no cookie
			
		Returns:	
			void
	*/
	getAuthUser:function(){
		var local_cache=arguments.callee;
		if (local_cache.user !== undefined) return local_cache.user;
		var user_id = $cookie.getAuthUserId()
		if (user_id){
			local_cache.user = Myna.Permissions.getUserById(user_id);
		} else {
			local_cache.user = null;
		}
		return local_cache.user;
	},
	/* Function: clear
			clears a cookie. Equivalent to $cookie.set(name, "",{expireSeconds:0})
		Parameters:
			name		-	name of cookie to delete
			path		-	*Optional, default null*
						If provided, the cookie on this path will be deleted
		Returns:	
			void
	*/
	clear:function(name,path){
		var options = {expireSeconds:0}
		if (path){
			options.path=path
		} 
		$cookie.set(name, "",options)	
	},
	
}
	

	
