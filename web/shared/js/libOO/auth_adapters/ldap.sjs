/* Topic: LDAP Auth Adapter 

The LDAP auth adapter ( see <AuthAdapters> ) allows for authentication against LDAP sources, including 
Active Directory.

There are no pre-defined auth_types for the ldap adapter. To create one, 
create a file in /WEB-INF/myna/auth_types/ with the name you would for your 
adapter. In this example we will call it /WEB-INF/myna/auth_types/our_domain.
in this file you will need a valid config. A config is a valid JSON String with 
the following properties:

auth_type				-	name of the this config. This should be the same as the config's 
							filename
adapter				-	"ldap"
server					-	Server and initial subtree to connect to.
							> ldap://server.yourdomain.com:389/o=top,ou=people
							> ldaps://server.yourdomain.com:636/o=top,ou=people
							Note: AD needs to have the domain translated to initial context
							> my.domain.com becomes ldap://my.domain.com:389/dc=my,dc=domain,dc=com
search	_columns		-	a comma separated list of ldap properties to use when 
							searching this adapter
map						-	object that maps Myna User properties to ldap properties. 
							At the very least this object must have these properties:
							"login,first_name,last_name"
filter					-	*Optional, default null*							
							LDAP query to filter results, ex: (ObjectClass=Person)
ad_domain				-	*Optional, default null* 
							The Active Directory domain. if set, then special Active 
							Directory processing is activated
username				-	*Optional, default null*
							username of user with whom to bind to the directory. Only 
							needed if you directory doesn't allow anonymous binds for 
							searches. AD users should just put the username here, all
							other should use a fully qualified Distinguished Name(dn)
password				-	*Optional, default null*
							password of user with whom to bind to the directory.




Here is an Active Directory 
example:

(code)
{
	"auth_type":"our_domain",
	"adapter":"ldap",
	"server":"ldap://our_domain.com/dc=our_domain,dc=com",
	"search_columns":"cn,name",
	"filter":"(ObjectClass=Person)",
	"ad_domain":"our_domain",
	"username":"search_user",
	"password":"search_password",
	"map":{
		"first_name":"givenName",
		"last_name":"sn",
		"middle_name":"initials",
		"login":"cn"
	}
}
(end)

Once this is in place you can add users via the Permissions area of the 
administrator

*/

var type="ldap";
var editConfig={
	items:[{
			xtype:"displayfield",
			name:"adapter",
			labelAlign:"left",
			labelWidth:110,
			fieldLabel:"AuthType Adapter",
			value:"ldap"
		},{
			xtype:"textfield",
			name:"auth_type",
			fieldLabel:"AuthType Name",
			value:""
		},{
			xtype:"textfield",
			name:"prettyName",
			fieldLabel:"Display Name",
			value:"AD Login"
		},{
			xtype:"textfield",
			name:"desc",
			fieldLabel:"Login Prompt",
			value:"Login using your Active Directory domain credentials"
		},{
			xtype:"textfield",
			name:"ad_domain",
			labelAlign:"top",
			value:"example",
			fieldLabel:"AD Domain (leave blank if not using Active Directory)"
		},{
			xtype:"textfield",
			name:"server",
			fieldLabel:"LDAP URL (use ldaps for secure)",
			value:"ldaps://domain.example.com/dc=domain,dc=example,dc=com"
		},{
			xtype:"textfield",
			name:"filter",
			fieldLabel:"User Filter (used to only match users)",
			value:"(sAMAccountType=805306368)"
		},{
			xtype:"textfield",
			name:"group_filter",
			fieldLabel:"Group Filter (used to only match only groups)",
			value:"(objectCategory=group)"
		},{
			xtype:"textfield",
			name:"search_columns",
			fieldLabel:"Search Attributes (used for finding users, comma separated)",
			value:"cn,givenName,sn"
		},{
			xtype:"textfield",
			name:"username",
			fieldLabel:"Username for searches (leave blank for anonymous bind)"
		},{
			xtype:"textfield",
			inputType:"password",
			name:"password",
			fieldLabel:"Password for search user (leave blank for anonymous bind)"
		},{
			xtype:"fieldset",
			title:"LDAP Attribute Map",
			width:300,
			defaults:{
				xtype:"textfield",
				labelAlign:"left",
				width:250,
				labelStyle:"font-weight:bold;",
				anchor:"99%",
				msgTarget:"under"
					
			},
			items:[
				{
					fieldLabel:"First Name",
					name:"attributeMap/first_name",
					value:"givenName"
				},{
					fieldLabel:"Last Name",
					name:"attributeMap/last_name",
					value:"sn"
				},{
					fieldLabel:"Middle Name",
					name:"attributeMap/middle_name",
					value:"initials"
				},{
					fieldLabel:"Username",
					name:"attributeMap/login",
					value:"sAMAccountName"
				},{
					fieldLabel:"Title",
					name:"attributeMap/title",
					value:"title"
				},{
					fieldLabel:"Email",
					name:"attributeMap/email",
					value:"mail"
				},{
					fieldLabel:"Distinguished Name",
					name:"attributeMap/dn",
					value:"distinguishedName"
				},{
					fieldLabel:"Group Membership",
					name:"attributeMap/member_group",
					value:"memberOf"
				},{
					fieldLabel:"Group Name",
					name:"attributeMap/group_name",
					value:"cn"
				},{
					fieldLabel:"Group Member",
					name:"attributeMap/group_member",
					value:"member"
				}
			]
	}]
}


//check the config file for needed values
this.config.checkRequired([
	"server",
	"search_columns",
	"map"	
]);
this.config.map.checkRequired([
	"login",
	"first_name",
	"last_name"
]);

function getLdap(){
	var ldap;
	if (this.config.username){
		if (this.config.ad_domain && !/@/.test(this.config.username)) {
			this.config.username +="@" +this.config.ad_domain;
		}								
		ldap = new Myna.Ldap(this.config.server, this.config.username,this.config.password);
	} else {
		ldap = new Myna.Ldap(this.config.server);  
	}	
	return ldap;	
}



function importGroup(name) {
	var $this = this;
	//clear existing memberships
	var appname = "{adapter}_{auth_type}".format(this.config)
	var group = Myna.Permissions.addUserGroup({
		name:name,
		appname:appname,
		description:"Imported group from provider '{auth_type}'".format($this.config)
	})
	var groupLdap = this.getLdap().lookup(name)
	//return Myna.printDump(groupLdap,"",5);

	new Myna.Query({
		ds:"myna_permissions",
		sql:<ejs>
			delete
					
			from
				user_group_members
			where 
				
				user_group_id in (
					select user_group_id 
					from user_groups ug
					where ug.appname = {appname}
				)


				
		</ejs>,
		values:{
			appname:appname
		}
	});


	// import members	
	groupLdap
		.attributes[$this.config.attributeMap.group_member||"member"]
		.forEach(function (dn) {
			//try{
				var userLdap = $this.getLdap().lookup(dn)
				var userObj = {
					login:"",
					first_name:"",
					last_name:"",
					middle_name:"",
					title:""
				}
				$this.config.attributeMap.forEach(function(ldap_attribute,myna_attribute){
					if (ldap_attribute in userLdap.attributes){
						userObj[myna_attribute] = userLdap.attributes[ldap_attribute][0];
					}
				})
				var user = Myna.Permissions.addUser(userObj)
				user.setLogin({type:$this.config.auth_type,login:userObj.login})
				group.addUsers(user.user_id)
			//} catch(e) {}
		})
	return group;
}


function userExists(username){
	var searchString="("+this.config.map.login+"="+username+")";
	return !!getLdap().search(searchString).length;
}

function getDN(username){
	var $this = this;
	var searchString="(cn="+username+")";
	if (Object.prototype.hasOwnProperty.call($this.config,"filter")){
		searchString = "(&" + $this.config.filter +searchString + ")";
	}
	var users = getLdap().search(searchString);
	if (users.length == 1) {
		var dn= users[0].name;
		if ($this.config.server.listLen("/")>1){
			dn+=","+$this.config.server.listLast("/");	
		}
		return dn;
	}
	if (users.length > 1) {
		Myna.log("warning","Auth type '"  + this.config.auth_type+ "': duplicate DN for username '"+username+"'",Myna.dump($req.data));
	}
	return null;
}

function isCorrectPassword(username,password){
	if (this.config.ad_domain){
		dn = username +"@"+this.config.ad_domain;
	} else {
		var dn = this.getDN(username);

		if (!dn) {
			Myna.log("AUTH","LDAP: unable to find user " + username +" in LDAP",Myna.dump(this));
			return false;
		}
	}
		 
	//try to auth against the ldap server, and serch for this dn
	try {
		new Myna.Ldap(this.config.server, dn, password);
		return true;
	} catch(e){
		Myna.log("AUTH","LDAP Authentication failed for " + dn,Myna.formatError(e));
		return false
	}
}

function searchUsers(search){
	var $this = this;
	var qry ="(|";
	
	$this.config.search_columns.split(/,/).forEach(function(col){
		 qry +="("+col+"=" + "*"+search +"*)"
	})
	
	qry +=")";
	
	if (Object.prototype.hasOwnProperty.call($this.config,"filter")){
		  qry = "(&" + $this.config.filter + qry + ")"
	}
	
	var attributes="cn";
	$this.config.map.forEach(function(v,p){
		attributes = attributes.listAppend(v);
	})
	
	//Myna.log("debug","ldap search qry " + qry);
	return new Myna.DataSet({
		data:$this.getLdap().search(qry,attributes)
		.filter(function(row){
			
			return $this.config.map.login in row.attributes 
			&& row.attributes[$this.config.map.login].length
			/* && $this.config.map.email in row.attributes
			&& row.attributes[$this.config.map.email].length */
		})
		.map(function(row){
			var result = {
				login:"",
				first_name:"",
				last_name:"",
				middle_name:"",
				email:"",
				title:""
			}
			$this.config.map.forEach(function(ldap_attribute,myna_attribute){
				 if (ldap_attribute in row.attributes){
					 result[myna_attribute] = row.attributes[ldap_attribute][0];
					 if (myna_attribute == "login") result[myna_attribute] = result[myna_attribute].toLowerCase(); 
				 }
			})
			return result;
		}),
		columns:"login,first_name,last_name,middle_name,email,title"
	})
	
}

function searchGroups(search){
	var $this = this;
	var qry ="(|";
	
	$this.config.search_columns.split(/,/).forEach(function(col){
		 qry +="("+col+"=" + "*"+search +"*)"
	})
	
	qry +=")";
	
	if (Object.prototype.hasOwnProperty.call($this.config,"group_filter")){
		  qry = "(&" + $this.config.group_filter + qry + ")"
	}

	var nameAttr = $this.config.attributeMap.login||"cn"
	
	
	
	Myna.log("debug","ldap search qry " + qry);
	return new Myna.DataSet({
		data:$this.getLdap().search(qry,nameAttr)
		.filter(function(row){
			return row.attributes[nameAttr].length
		})
		.map(function(row){
			return {
				name:row.name,
				id:$this.config.auth_type + "/" + row.name
			}
			
		}),
		columns:"name,id"
	})
	
}



function getUserByLogin(login){
	var $this = this;
	var qry ="("+ $this.config.map.login+ "="+login+")";
		
	if (Object.prototype.hasOwnProperty.call($this.config,"filter")){
		  qry = "(&" + $this.config.filter + qry + ")"
	}
		  
	return $this.getLdap().search(qry).map(function(row){
	  var result = {
		  login:"",
		  first_name:"",
		  last_name:"",
		  middle_name:"",
		  title:""
	  }
	  $this.config.map.forEach(function(ldap_attribute,myna_attribute){
			if (ldap_attribute in row.attributes){
				result[myna_attribute] = row.attributes[ldap_attribute][0];
			}
	  })
	  if (result.login.length) return result
	 else return null 
  })[0];
	
}
