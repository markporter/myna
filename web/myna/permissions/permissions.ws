{
/* =========== setup ======================================================== */
	name:$application.prettyName,
   	desc:<ejs>
		Service for interacting with <%=$application.prettyName%>.
		All methods except "logout, auth, auth_transfer, has_active_session" require authentication via 
		HTTP Basic Auth or stored cookie (as set by the <a href="#auth">auth</a> method). 
		Authenticated users must have either the myna_admin/full_admin_access right or
		&lt;appname&gt;/edit_permissions right
   </ejs>,
	no_auth_list:"logout,auth,auth_transfer,has_active_session",
	admin_only_list:[
		"save_user_data",
		"save_user_login_data",
		"save_right_data",
		"save_app_data",
		"qry_apps",
		"delete_app",
		"get_app_data"
	].join(),
	beforeHandler:function(name,def,args){
		if (this.spec.admin_only_list.listContains(name)){
			hasAccess = this.spec.localFunctions.hasAccess(this.authUserId,"myna_admin");
			if (!hasAccess){
				throw 	new Error("You do not have access to edit rights or users")
			}
		} else if ("appname" in args && !this.spec.no_auth_list.listContains(name)){
			var hasAccess = this.spec.localFunctions.hasAccess(this.authUserId,args.appname);
			if (!hasAccess){
				throw new Error("You do not have access to edit permissions for " + args.appname)
			}
		} 
		
	},
	afterHandler:function(name,def,args,retval){
		
	},
	authFunction:function(authData){
		if (this.spec.no_auth_list.listContainsNoCase(authData.functionName)){
			return true;
		}
		if (this.authUserId && this.authUserId.length){
			return true;
		}
		if( this.spec.functions.auth.handler(authData)){ 		
			return true;
		} else {
			return false;
		}
	},
	authTimeout:20,
/* =========== Local Functions ============================================== */
	localFunctions:{
		hasAccess:function(user_id,appname){
			if (user_id == "myna_admin"){
				return true;
			} else {
				var user = Myna.Permissions.getUserById(user_id);
				if (user == null) {
					return false
				} else {
					return user.hasRight(appname,"edit_permissions") 
						|| user.hasRight("myna_admin","full_admin_access");
				}
			}
		}
	},
/* =========== Web Service Functions ======================================== */
	functions:{
	/* --------- auth  ------------------------------------------------------- */
		auth:{
			desc:"Login and obtain auth cookie",
			returns:{
				success:"numeric",
				errors:{
					username:"string",
					password:"string"
				}
			},
			params:[
				{ name:"username", type:"string", },
				{ name:"password", type:"string" },
				{ name:"appname", type:"string" },
			],
			handler:function(data){
				data.checkRequired(["username","password"]);
				var authenticated = false;
				
				if (data.username.toLowerCase() == "admin"){
					if (data.password.hashEquals(Myna.getGeneralProperties().admin_password)){
						this.setAuthUserId("myna_admin")
						authenticated = true;
					} 
				}else {
					var P = Myna.Permissions;
					try {
						var user =P.getUserByLogin("local",data.username);
						if (user.isCorrectPassword(data.username,data.password)) {
							this.setAuthUserId(user.get_user_id())
							authenticated = true;
						}
					} catch(e){
						Myna.log("error","login failed for " + data.username,Myna.formatError(e) + "<hr>" + Myna.dump(data));
						return 0;	
					}
				}
				
				if (authenticated) {
					if ("appname" in data) {
						var hasAccess = this.spec.localFunctions.hasAccess(this.authUserId,data.appname);
						if (hasAccess){
							return {success:true}
						} else {
							return{
								success:false,
								errors:{
									username:"This user does not have access to edit " + data.appname	
								}
							}
						}
					} else return {success:true}
				} else {
					return{
						success:false,
						errors:{
							password:"Username or password is incorrect"	
						}
					}
				}
				
			},
		},
	/* --------- logout  ----------------------------------------------------- */
		logout:{
			desc:"Logout and end session",
			returns:"void",
			handler:function(data){
				$session.clear();
				this.clearAuthUserId();
			},
		},
	/* --------- has_active_session  ----------------------------------------- */
		has_active_session:{
			desc:"returns true is session is active",
			returns:{
				success:"numeric",
				message:"string"
			},
			params:[
				{name:"appname", type:"string", required:true}
			],
			handler:function(data){
				if (this.authUserId){
					var hasAccess = this.spec.localFunctions.hasAccess(this.authUserId,data.appname);
					if (hasAccess){
						return {success:1}
					} else {
						return  {
							success:0,
							message:"You do not have access to edit permissions for " + data.appname
						}
					}
					
				} else {
					return {success:0}
				}
			},
		},
	/* ========= App Functions ============================================= */
		/* --------- qry_apps  ---------------------------------------------- */
			qry_apps:{
				desc:"Queries all apps, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'appname' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" }
				],
				returns:Myna.WebService.generateQueryType({
					appname:"string",
					description:"string",
					display_name:"string"
				}),
				handler:function(data){
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								appname,
								description,
								display_name,
								inactive_ts
							from apps					
							where 1=1
							<@if data.search.length>
								and lower(appname  || description  ||display_name ) like {search}
							</@if>
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							search:"%" + data.search.toLowerCase() + "%"
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit,
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
								if (obj[key] == null){
									obj[key] = "";
								}
							})
							return obj;
						}
					})
					
					return qry.result;
				}		
			},
		/* --------- get_app_data  ------------------------------------------ */
			get_app_data:{
				desc:"returns app data for the supplied appname",
				params:[
					{ name:"appname", type:"string"},
				],
				returns:{
					success:"numeric",
					data:{
						appname:"string",
						description:"string",
						display_name:"string"
					}
				},
				handler:function(data){
					var values= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								appname,
								description,
								display_name
							from apps					
							where appname = {appname}
						</ejs>,
						values:{
							appname:data.appname||0
						}
					});
					
					if (values.data.length) {
						values = values.data[0]	
					} else  {
						values ={
							appname:"app_name_here",
							description:"Enter a short description",
							display_name:"Display Name Here"
						}
					}
					
					return {
						success:1,
						data:values	
					}
				}
			},
		/* --------- save_app_data  ----------------------------------------- */
			save_app_data:{
				desc:"saves app data",
				params:[
					{ name:"appname", type:"string"},
					{ name:"description", type:"string"},
					{ name:"display_name", type:"string"}
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					Myna.Permissions.addApp(data);
					return {success:1}
				}
			},
		/* --------- delete_app  -------------------------------------------- */
			delete_app:{
				desc:"inactivates app data for the supplied appname",
				params:[
					{ name:"appname", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					var man = dm.getManager("apps")
					var exists = man.findBeans(data.appname);
					if (exists.length){
						exists[0].set_inactive_ts(new Date());
					} 
					return {success:1}
				}
			},
			
		
		
	
	/* ========= User Functions ============================================== */
		/* --------- qry_users  ----------------------------------------------- */
			qry_users:{
				desc:"Queries all users, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'last_name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" },
					{ name:"show_inactive", type:"numeric", defaultValue:1 },
					{ name:"providers", type:"string", defaultValue:Myna.Permissions.getAuthTypes().join() }
				],
				returns:Myna.WebService.generateQueryType({
					user_id:"string",
					last_name:"string",
					first_name:"string",
					middle_name:"string",
					title:"string",
					created:"string",
					country:"string",
					dob:"string",
					email:"string",
					gender:"string",
					language:"string",
					last_name:"string",
					middle_name:"string",
					nickname:"string",
					postcode:"string",
					timezone:"string",
					inactive_ts:"string",
					logins:"string"
				}),
				handler:function(data){
					
					var login_list="";
					if (data.search.length){
						login_list= new Myna.Query({
							dataSource:"myna_permissions",
							sql:<ejs>
								select
									user_id
								from user_logins
								where login like {search}
									
							</ejs>,
							values:{
								search:"%" + data.search.toLowerCase() + "%"
							},
							maxRows:25
						}).valueArray("user_id").join()
					}
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								user_id,
								last_name,
								first_name,
								middle_name,
								title,
								created,
								country,
								dob,
								email,
								gender,
								language,
								nickname,
								postcode,
								timezone,
								inactive_ts,
								'' as "logins"
							from users
							where 1=1
							<@if data.search.length>
								and (
									lower(user_id || last_name || first_name || middle_name || title ) like {search}
									or user_id in  ({login_list})
								)
							</@if>
							<@if !data.show_inactive>
								and inactive_ts is null
							</@if>
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							search:"%" + data.search.toLowerCase() + "%",
							login_list:login_list
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit,
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
								if (obj[key] == null){
									obj[key] = "";
								}
							})
							obj.logins = new Myna.Query({
								dataSource:"myna_permissions",
								sql:<ejs>
									select type || '/' || login as login from user_logins
									where user_id = {user_id}
								</ejs>,
								values:{
									user_id:obj.user_id
								}
							
							}).valueArray("login").join()
							return obj;
						}
					})
					
					
					
					return qry.result;
				}		
			},
		/* --------- get_user_data  ------------------------------------------- */
			get_user_data:{
				desc:"returns user data for the supplied user_id",
				params:[
					{ name:"user_id", type:"string" }
				],
				returns:{
					success:"numeric",
					data:{
						user_id:"string",
						last_name:"string",
						first_name:"string",
						middle_name:"string",
						title:"string",
						created:"string",
						country:"string",
						dob:"string",
						email:"string",
						gender:"string",
						language:"string",
						last_name:"string",
						middle_name:"string",
						nickname:"string",
						postcode:"string",
						timezone:"string",
						inactive_ts:"string"
					}
				},
				handler:function(data){
					var values= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								user_id,
								last_name,
								first_name,
								middle_name,
								title,
								created,
								country,
								dob,
								email,
								gender,
								language,
								last_name,
								middle_name,
								nickname,
								postcode,
								timezone,
								inactive_ts,
								'' as "logins"
							from users
							where user_id = {user_id}
						</ejs>,
						values:{
							user_id:data.user_id||0
						},
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
							})
							obj.logins = new Myna.Query({
								dataSource:"myna_permissions",
								sql:<ejs>
									select login from user_logins
									where user_id = {user_id}
								</ejs>,
								values:{
									user_id:obj.user_id
								}
							
							}).valueArray("login").join("\n")
							return obj;
						}
					});
					
					if (values.data.length) {
						values = values.data[0]	
					} else  {
						values ={
							user_id:Myna.createUuid(),
							last_name:"New User",
							first_name:"",
							middle_name:"",
							title:"",
							created:"",
							inactive_ts:""
						}
					}
					
					return {
						success:1,
						data:values	
					}
				}
			},
		/* --------- save_user_data  ------------------------------------------ */
			save_user_data:{
				desc:"saves user data",
				params:[
					{name:"user_id", type:"string" },
					{name:"last_name", type:"string"},
					{name:"first_name", type:"string"},
					{name:"middle_name", type:"string"},
					{name:"title", type:"string"},
					{name:"country",type:"string"},
					{name:"dob",type:"string"},
					{name:"email",type:"string"},
					{name:"gender",type:"string"},
					{name:"language",type:"string"},
					{name:"last_name",type:"string"},
					{name:"middle_name",type:"string"},
					{name:"nickname",type:"string"},
					{name:"postcode",type:"string"},
					{name:"timezone",type:"string"},
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					Myna.Permissions.getUserById(data.user_id)
					
					var man = dm.getManager("users")
					var exists = man.find(data.user_id).length;
					if (exists){
						var user =Myna.Permissions.getUserById(data.user_id)
						if ("dob" in data){
							try{
								data.dob = Date.parseDate(data.dob,"m-d-Y")
							} catch(e){}
						}
						user.setFields(data);
						user.reactivate();
						
					} else {
						
						Myna.Permissions.addUser(data);	
					}
					
					return {success:1}
				}
			},
		/* --------- search_users  ----------------------------------------------- */
			search_users:{
				desc:"Queries all users, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'last_name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" },
					{ name:"show_inactive", type:"numeric", defaultValue:1 },
					{ name:"providers", type:"string", defaultValue:Myna.Permissions.getAuthTypes().join() }
				],
				returns:{
					totalRows:"numeric",
					data:[{
						user_id:"string",
						last_name:"string",
						first_name:"string",
						middle_name:"string",
						title:"string",
						type:"string",
						/* created:"string",
						country:"string",
						dob:"string",
						email:"string",
						gender:"string",
						language:"string",
						last_name:"string",
						middle_name:"string",
						nickname:"string",
						postcode:"string",
						timezone:"string",
						inactive_ts:"string", */
						login:"string"
					}]
				},
				handler:function(data){	
					var search = data.search;
					var result=[]
					if (search.length >= 2){
						
						data.providers.listToArray().forEach(function(type){
							var p = Myna.Permissions.getAuthAdapter(type);
							if ("searchUsers" in p){
								p.searchUsers(search).forEach(function(user){
									user.type = type;
									result.push(user)
								})	
							} else Myna.log("debug","No searchUsers in authAdapter" + type,Myna.dump(p.getProperties()));
						})
						
					}
					result.sort(function(a,b){
						return String.compareAlpha(a.first_name+a.last_name, b.first_name+b.last_name)
					})
					return {
						totalRows:result.length,
						data:result
					}
				}
			},
		/* --------- delete_user  --------------------------------------------- */
			delete_user:{
				desc:"inactivates the indicated user",
				params:[
					{ name:"user_id", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					var user =Myna.Permissions.getUserById(data.user_id)
					if (user) user.inactivate();
					return {success:1}
				}
			},
	/* ========= User_login Functions ======================================== */
		/* --------- qry_user_logins  ----------------------------------------- */
			qry_user_logins:{
				desc:"Queries all user_logins, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"user_id", type:"string"},
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'last_name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" }
				],
				returns:Myna.WebService.generateQueryType({
					user_login_id:"string",
					login:"string",
					password:"string",
					type:"string",
					user_name:"string",
					user_id:"string"
				}),
				handler:function(data){
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								user_login_id,
								login,
								password,
								u.first_name,
								u.middle_name,
								u.last_name,
								ul.type,
								'' as user_name,
								
								u.user_id
							from 
								user_logins ul,
								users u					
							where u.user_id = ul.user_id
							and ul.user_id = {user_id}
							<@if data.search.length>
								and lower(user_login_id || login  || password  || type  || u.user_id ) like {search}
							</@if>
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							search:"%" + data.search.toLowerCase() + "%",
							user_id:data.user_id
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit,
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
								if (obj[key] === null){
									obj[key] = "";
								}
							})
							obj.user_name = obj.first_name + ' ' + obj.middle_name + ' ' + obj.last_name
							return obj;
						}
					})
					return qry.result;
				}		
			},
		/* --------- get_user_login_data  ------------------------------------- */
			get_user_login_data:{
				desc:"returns user_login data for the supplied user_login_id",
				params:[
					{ name:"user_login_id", type:"string" }
				],
				returns:{
					success:"numeric",
					data:{
						user_login_id:"string",
						login:"string",
						password:"string",
						password2:"string",
						type:"string",
						user_id:"string"
					}
				},
				handler:function(data){
					var values= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								user_login_id,
								login,
								'**** UNCHANGED ****' as password,
								'**** UNCHANGED ****' as password2,
								type,
								user_id
							from user_logins					
							where user_login_id = {user_login_id}
						</ejs>,
						values:{
							user_login_id:data.user_login_id||0
						}
					});
					
					if (values.data.length) {
						values = values.data[0]	
					} else  {
						values ={
							user_login_id:Myna.createUuid(),
							login:"",
							password:"**** UNCHANGED ****",
							password2:"**** UNCHANGED ****",
							type:"",
							user_id:""
						}
					}
					
					return {
						success:1,
						data:values	
					}
				}
			},
		/* --------- save_user_login_data  ------------------------------------ */
			save_user_login_data:{
				desc:"saves user_login data",
				params:[
					{ name:"user_login_id", type:"string" },
					{ name:"login", type:"string"},
					{ name:"password", type:"string"},
					{ name:"password2", type:"string"},
					{ name:"type", type:"string"},
					{ name:"user_id", type:"string"}
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					
					if (data.password == "**** UNCHANGED ****"){
						delete data.password;
						
					} else if (data.password != data.password2){
						return {
							success:0,
							errors:{
								password2:"Passwords do not match, please try again"	
							}
						}
					} 
					var user = Myna.Permissions.getUserById(data.user_id);
					user.setLogin(data)
					return {success:1}
				}
			},
		/* --------- delete_user_login  --------------------------------------- */
			delete_user_login:{
				desc:"returns user_login data for the supplied user_login_id",
				params:[
					{ name:"user_login_id", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					new Myna.Query({
						ds:"myna_permissions",
						sql:"delete from user_logins where user_login_id ={id}",
						values:{
							id:data.user_login_id	
						}
					})
					return {success:1}
				}
			},
			
	/* ========= User_group Functions ======================================== */
		/* --------- qry_user_groups  ----------------------------------------- */
			qry_user_groups:{
				desc:"Queries all user_groups, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"appname", type:"string", defaultValue:'myna_admin' },
					{ name:"search", type:"string", defaultValue:"" }
				],
				returns:Myna.WebService.generateQueryType({
					user_group_id:"string",
					appname:"string",
					description:"string",
					name:"string"
				}),
				handler:function(data){
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								user_group_id,
								appname,
								description,
								name
							from user_groups					
							where 1=1
							<@if data.search.length>
								and lower(user_group_id || appname  || description  || name ) like {search}
							</@if>
							<@if data.appname != "myna_admin">
								and appname = {appname}
							</@if>
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							appname:data.appname,
							search:"%" + data.search.toLowerCase() + "%"
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit,
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
							})
							return obj;
						}
					})
					
					return qry.result;
				}		
			},
		/* --------- get_user_group_data  ------------------------------------- */
			get_user_group_data:{
				desc:"returns user_group data for the supplied user_group_id",
				params:[
					{ name:"user_group_id", type:"string" },
					{ name:"appname", type:"string", defaultValue:"myna_admin" },
				],
				returns:{
					success:"numeric",
					data:{
						user_group_id:"string",
						appname:"string",
						description:"string",
						name:"string"
					}
				},
				handler:function(data){
					var values= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								user_group_id,
								appname,
								description,
								name
							from user_groups					
							where user_group_id = {user_group_id}
						</ejs>,
						values:{
							user_group_id:data.user_group_id||0
						},
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
							})
							
							return obj;
						}
					});
					
					if (values.data.length) {
						values = values.data[0]	
					} else  {
						values ={
							user_group_id:Myna.createUuid(),
							description:"",
							name:""
						}
						if (data.appname != "myna_admin"){
							values.appname= data.appname
						}
						dm.getManager("user_groups").create(values);
					}
					
					return {
						success:1,
						data:values	
					}
				}
			},
		/* --------- save_user_group_data  ------------------------------------ */
			save_user_group_data:{
				desc:"saves user_group data",
				params:[
					{ name:"user_group_id", type:"string" },
					{ name:"appname", type:"string"},
					{ name:"description", type:"string"},
					{ name:"name", type:"string"}
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					var man = dm.getManager("user_groups")
					var exists = man.find(data.user_group_id).length;
					if (exists){
						man.getById(data.user_group_id).setFields(data);
					} else {
						man.create(data);	
					}
					return {success:1}
				}
			},
		/* --------- delete_user_group  --------------------------------------- */
			delete_user_group:{
				desc:"returns user_group data for the supplied user_group_id",
				params:[
					{ name:"user_group_id", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					new Myna.Query({
						ds:"myna_permissions",
						sql:"delete from user_groups where user_group_id ={id}",
						values:{
							id:data.user_group_id	
						}
					})
					return {success:1}
				}
			},
			
		
	/* ========= User_group_member Functions ================================= */
		/* --------- qry_user_group_members  ---------------------------------- */
			qry_user_group_members:{
				desc:"Queries all user_group_members, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"user_group_id", type:"string" },
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'user_name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" }
				],
				returns:Myna.WebService.generateQueryType({
					user_group_member_id:"string",
					user_group_id:"string",
					user_id:"string",
					user_name:"string",
					logins:"string"
				}),
				handler:function(data){
					
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								ugm.user_group_member_id,
								ugm.user_group_id,
								ugm.user_id,
								u.first_name,
								u.middle_name,
								u.last_name,
								'' as user_name,
								'' as logins
							from user_group_members ugm,
									users u					
							where
								ugm.user_id = u.user_id
							<@if data.search.length>
								and lower(ugm.user_group_member_id || ugm.user_group_id  || ugm.user_id || u.first_name || ' ' || u.middle_name || ' ' || u.last_name ) like {search}
							</@if>
							and ugm.user_group_id = {id}
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							id:data.user_group_id,
							search:"%" + data.search.toLowerCase() + "%"
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit,
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
								if (obj[key] === null){
									obj[key] = "";
								}
							})
							obj.user_name =obj.first_name + ' ' + obj.middle_name + ' ' + obj.last_name;
							obj.logins = new Myna.Query({
								dataSource:"myna_permissions",
								sql:<ejs>
									select type || '/' || login as login from user_logins
									where user_id = {user_id}
								</ejs>,
								values:{
									user_id:obj.user_id
								}
							
							}).valueArray("login").join()
							return obj;
						}
					})
					
					return qry.result;
				}		
			},
		/* --------- add_user_group_member  ----------------------------------- */
			add_user_group_member:{
				desc:"saves user_group_member data",
				params:[
					{ name:"type", type:"string"},
					{ name:"login", type:"string"},
					{ name:"first_name", type:"string"},
					{ name:"last_name", type:"string"},
					{ name:"middle_name", type:"string"},
					{ name:"email", type:"string"},
					{ name:"login", type:"string"},
					{ name:"user_group_id", type:"string"},
					{ name:"appname", type:"string", required:true},
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					var user =Myna.Permissions.getUserByLogin(data.type,data.login)
					if (!user){
						user = Myna.Permissions.addUser(data)	
						user.setLogin(data)
					}
					data.user_id=user.user_id;
					var ug =dm.getManager("user_groups").getById(data.user_group_id); 
					if (
						ug.get_appname() != data.appname 
						&& !this.getAuthUser().hasRight("myna_admin","full_admin_access")
					){
						throw new Error("User Group "+data.user_group_id+" does not match appname " + data.appname)
					}
					var man = dm.getManager("user_group_members")
					var exists = man.find(data,true);
					if (exists.length){
						man.getById(exists[0]).setFields(data);
					} else {
						man.create(data);	
					}
					return {success:1}
				}
			},
		/* --------- delete_user_group_member  -------------------------------- */
			delete_user_group_member:{
				desc:"returns user_group_member data for the supplied user_group_member_id",
				params:[
					{ name:"user_group_member_id", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					new Myna.Query({
						ds:"myna_permissions",
						sql:"delete from user_group_members where user_group_member_id ={id}",
						values:{
							id:data.user_group_member_id	
						}
					})
					return {success:1}
				}
			},
			
		
	/* ========= Assigned_right Functions ==================================== */
		/* --------- qry_assigned_rights  ------------------------------------- */
			qry_assigned_rights:{
				desc:"Queries all assigned_rights, 25 rows at a time, optionally filtering by a search string",
				params:[
					{ name:"user_group_id", type:"string" },
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" }
				],
				returns:Myna.WebService.generateQueryType({
					assigned_right_id:"string",
					right_id:"string",
					user_group_id:"string",
					appname:"string",
					name:"string",
					description:"string"
				}),
				handler:function(data){
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								ar.assigned_right_id,
								ar.right_id,
								ar.user_group_id,
								r.appname,
								r.name,
								r.description
							from assigned_rights ar, rights r					
							where r.right_id = ar.right_id
							
							<@if data.search.length>
								and lower(ar.assigned_right_id || ar.right_id  || ar.user_group_id || r.appname || r.name || r.description) like {search}
							</@if>
							and user_group_id={id}
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							id:data.user_group_id,
							search:"%" + data.search.toLowerCase() + "%"
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit
					})
					
					return qry.result;
				}		
			},
		/* --------- add_assigned_right  -------------------------------------- */
			add_assigned_right:{
				desc:"saves assigned_right data",
				params:[
					{ name:"right_id", type:"string"},
					{ name:"user_group_id", type:"string"},
					{ name:"appname", type:"string", required:true},
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					var ug =dm.getManager("user_groups").getById(data.user_group_id); 
					if (
						ug.get_appname() != data.appname 
						&& !this.getAuthUser().hasRight("myna_admin","full_admin_access")
					){
						throw new Error("User Group "+data.user_group_id+" does not match appname " + data.appname)	
					}
					var man = dm.getManager("assigned_rights")
					var exists = man.find(data,true);
					if (!exists.length){
						
						man.create(data);	
					}
					return {success:1}
				}
			},
		/* --------- delete_assigned_right  ----------------------------------- */
			delete_assigned_right:{
				desc:"returns assigned_right data for the supplied assigned_right_id",
				params:[
					{ name:"assigned_right_id", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					new Myna.Query({
						ds:"myna_permissions",
						sql:"delete from assigned_rights where assigned_right_id ={id}",
						values:{
							id:data.assigned_right_id	
						}
					})
					return {success:1}
				}
			},
			
		
	
	/* ========= Right Functions ============================================= */
		/* --------- qry_rights  ---------------------------------------------- */
			qry_rights:{
				desc:"Queries all rights, 25 rows at a time, optionally filtering by a search string",
				params:[
				{ name:"appname", type:"string", defaultValue:""},
					{ name:"start", type:"string", defaultValue:0 },
					{ name:"limit", type:"string", defaultValue:25 },
					{ name:"sort", type:"string", defaultValue:'name' },
					{ name:"dir", type:"string", defaultValue:'asc' },
					{ name:"search", type:"string", defaultValue:"" }
				],
				returns:Myna.WebService.generateQueryType({
					right_id:"string",
					appname:"string",
					description:"string",
					name:"string"
				}),
				handler:function(data){
					var qry= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								right_id,
								appname,
								description,
								name
							from rights					
							where 1=1
							<@if data.search.length>
								and lower(right_id || appname  || description  || name ) like {search}
							</@if>
							<@if data.appname.length && data.appname != "myna_admin">
							and appname = {appname}
							</@if>
							order by <%=data.sort%> <%=data.dir%> 
						</ejs>,
						values:{
							appname:data.appname,
							search:"%" + data.search.toLowerCase() + "%"
						},
						startRow:parseInt(data.start)+1,
						maxRows:data.limit,
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
							})
							return obj;
						}
					})
					
					return qry.result;
				}		
			},
		/* --------- get_right_data  ------------------------------------------ */
			get_right_data:{
				desc:"returns right data for the supplied right_id",
				params:[
					{ name:"right_id", type:"string" },
					{ name:"appname", type:"string", defaultValue:"myna_admin" },
				],
				returns:{
					success:"numeric",
					data:{
						right_id:"string",
						appname:"string",
						description:"string",
						name:"string"
					}
				},
				handler:function(data){
					var values= new Myna.Query({
						dataSource:"myna_permissions",
						sql:<ejs>
							select
								right_id,
								appname,
								description,
								name
							from rights					
							where right_id = {right_id}
						</ejs>,
						values:{
							right_id:data.right_id||0
						},
						rowHandler:function(row){
							var obj = row.getRow();
							obj.getKeys().forEach(function(key){
								if (obj[key] instanceof Date){
									obj[key] = obj[key].format("m/d/Y H:i:s");
								}
							})
							
							return obj;
						}
					});
					
					if (values.data.length) {
						values = values.data[0]	
					} else  {
						values ={
							right_id:Myna.createUuid(),
							/* 
								we don't include appname so that the last value stays. 
								This makes it more convenient to add multiple rights 
								for the same app
							*/
							/* appname:"", */
							description:"",
							name:""
						}
					}
					
					return {
						success:1,
						data:values	
					}
				}
			},
		/* --------- save_right_data  ----------------------------------------- */
			save_right_data:{
				desc:"saves right data",
				params:[
					{ name:"right_id", type:"string" },
					{ name:"appname", type:"string"},
					{ name:"description", type:"string"},
					{ name:"name", type:"string"}
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					var man = dm.getManager("rights")
					var exists = man.find(data.right_id).length;
					if (exists){
						man.getById(data.right_id).setFields(data);
					} else {
						man.create(data);	
					}
					return {success:1}
				}
			},
		/* --------- delete_right  -------------------------------------------- */
			delete_right:{
				desc:"returns right data for the supplied right_id",
				params:[
					{ name:"right_id", type:"string" }
				],
				returns:{
					success:"numeric",
				},
				handler:function(data){
					Myna.Permissions.deleteRight(data.right_id)
					return {success:1}
				}
			},
			
		
		
	/*  */
	}
}

