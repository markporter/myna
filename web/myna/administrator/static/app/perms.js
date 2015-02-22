/*jshint unused:false*/
/*global Ext $FP appVars App  console CodeMirror*/
Ext.override(Ext.view.AbstractView, { 
	onRender: function() 
	{ 
		var me = this; 
		this.callOverridden(); 
		if (me.loadMask && Ext.isObject(me.store)) { 
			me.setMaskBind(me.store); 
		} 
	} 
});

/* ---------------- stupid xtype fix ---------------------------------------- */
	Ext.ClassManager.instantiateByAlias=function() {
		var alias = arguments[0],
		args = Array.parse(arguments),
		className = this.getNameByAlias(alias);

		if (!className) {
			className = this.maps.aliasToName[alias];
			if (!className) {
				console.log(args[1],"Config Object")
				throw new Error("Unknown xtype: " + alias)
			}


			Ext.syncRequire(className);
		}

		args[0] = className;

		return this.instantiate.apply(this, args);
	}

var controllers=[]
/* ----------- ViewPort ----------------------------------------------------- */
	Ext.define('App.view.Viewport' ,{
		extend: 'Ext.container.Viewport',
		alias: 'widget.view_main',
		initComponent: function() {
			Ext.apply(this,{
				layout:"fit",
				items:[{
					layout:"border",
					tbar:[{
							xtype:"tbtext",
							text:"<div class='app_title'>"+appVars.title+"</div>"
						},{
							xtype:"tbfill"
						},{
							xtype:"tbtext",
							text:"&nbsp;".repeat(10)

						},{
							text:"Logout",
							iconCls:"icon_logout",
							handler:function(){
								location.href=appVars.appUrl+"main/logout"
							}
					}],
					items:[{//center
						//	xtype:"panel",
							region:"center",
							frame:false,
							layout:"fit",
							border:false,
																
							tbar:[],
							id:"center_tabs",
							//hidden:true,
							xtype:"tabpanel",
							autoDestroy:true,
							defaults:{
								closable:false,
							},
							items:[
								{
									id:"vAuthTypes",
									xtype:"auth_type_main",
									iconCls:"icon_adapter"
								},
								{
									id:"vUsersGrid",
									xtype:"user_grid",
									title:"Manage Users"
								},
								{
									id:"vRights",
									title:"Manage Rights",
									xtype:"right_grid"
								},
								{
									id:"vGroups",
									xtype:"group_grid",
									
								}
								

							],
							listeners: {
							}
								
						
						}]
				}]
			})
			this.callParent(arguments);
		}
	});
/* ----------- "U": local utility functions --------------------------------- */
	var U = {
		directMask:function(panel,text,func){
			var dom;
			var errorMsg = "App.directMask: " + String(panel) + " is not a valid panel";
			if (panel instanceof Ext.panel.Panel){
				dom = panel.getEl()
			} else if (typeof panel == "string"){
				dom =Ext.getCmp(panel);
				if (!dom){
					dom = Ext.get(panel);	
				}
				if (!dom){
					throw new Error(errorMsg);
				}
			} else {
				dom = Ext.get(panel);
				//throw new Error(errorMsg);
			}
			
			if (typeof text == "function"){
				func = text;
				text="Please Wait";
			}
			dom.mask(text)
			return function(){
				dom.unmask()
				return func.apply(this,Array.parse(arguments))
			}
		},
		infoMsg: function(/*template,replacement 1,replacement 2,... */){

			var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 0));
			Ext.create('widget.uxNotification', {
				title: 'Notification',
				corner: 'tr',
				//stickOnClick: false,
				//manager: 'center_tabs',
				iconCls: 'ux-notification-icon-information',
				slideInDuration: 800,
				//closable:false,
				slideBackDuration: 1500,
				slideInAnimation: 'elasticIn',
				slideBackAnimation: 'elasticIn',
				cls: 'ux-notification-light',

				html: s
			}).show();
		},
		addCenterTab:function(config,ordinal){
				Ext.apply(config,{
					closable:true
				})
				Ext.applyIf(config,{
					id:Ext.id()
				})
				var tabPanel = Ext.getCmp("center_tabs");
				tabPanel.show();
				if (tabPanel.items.containsKey(config.id)){
					tabPanel.setActiveTab(config.id)
				}else {
					if (ordinal !== undefined){
						tabPanel.insert(ordinal,config);	
					} else {
						tabPanel.add(config);
					}
					tabPanel.setActiveTab(config.id)
				}
				
			},
		linkRenderer:function(val,meta){
			meta.tdCls="link"
			return val;
		}
	}
/* =========== General View Components ====================================== */
/* =========== AuthTypes ==================================================== */
	/* ----------- Controller ------------------------------------------------ */
		controllers.push("AuthType");
		Ext.define('App.controller.AuthType', {
			extend: 'Ext.app.Controller',
			init: function() {
				this.control({
					viewport:{
						manage_auth_types:function () {
							this.showMain();
						}
					},
					'auth_type_grid': {
						manage_tables: this.manageTables
					},
					'auth_type_grid button[action="add_auth_type"]':{
						click:this.addAuthType
					},
					'auth_type_edit':{
						auth_type_save:function(event){

							var form = event.src.form;
							form.findField("errors").setValue("");
							form.findField("errors").hide();
							this.saveAuthTypeForm(event.model,event.values,function(result){
								if (result.success){
									form.close();
								}else{
									if (result.errorDetail) {
										form.findField("errors").setValue(result.errorDetail)
										form.findField("errors").show();
									}
									form.markInvalid(result.errors);
									//U.infoMsg(result)
								}
							});
						}
					},
					'auth_type_edit button[action="save"]':{
						click:this.saveAuthTypeForm
					},
					'auth_type_edit button[action="delete"]':{
						click:this.deleteAuthType
					}
					
				});
			},
			
			
			
			deleteAuthType:function editAuthType(button){
				var fp = button.up("form");
				var form = fp.form;

				var auth_type = form.findField("auth_type").getValue();
				if (window.confirm("Remove AuthType '" + auth_type +"'?")){
					
					$FP.AuthType.remove({auth_type:auth_type},U.directMask(fp,"Removing Auth Type", function(){
						U.infoMsg(auth_type +" removed.");
						form.close();
						button.up("auth_type_grid").getStore().load();
						
						
					}));
				}
			},
			saveAuthTypeForm:function(model,values,cb){
				$FP.AuthType.save(
					values,
					function(result){
						if (result.success) {
							model.commit();
						} else {
							model.reject();
						}
						if (cb) cb(result);
					}
				);
				
			
			}
			
			
			
		});
	/* =========== Views ===================================================== */
		/* ----------- auth_type_main ------------------------------------------------- */
			Ext.define('App.view.auth_type.Main', {
				extend: 'Ext.panel.Panel',
				alias:'widget.auth_type_main',
				title:"Auth Types",
				layout:"fit",
				items:[{
					id:"auth_type_grid",
					xtype:"auth_type_grid"
				}],
				
				initComponent:function(){
					this.callParent(arguments);
				}
			});
		/* ----------- auth_type_edit ------------------------------------------------- */
			Ext.define('App.view.auth_type.Edit', {
				extend: 'Ext.form.Panel',
				alias:'widget.auth_type_edit',
				//layout:"fit",
				frame:true,
				autoScroll:true,
				width:500,
				defaults:{
					labelStyle:"font-weight:bold;",
					//labelAlign:"top",
					//labelWidth:200,
					anchor:"99%",
					labelAlign:"top",
					xtype:"textfield",
					enableKeyEvents:true,
					msgTarget:"under"
					
				},	
				
				buttons:[{
					text:"Save",
					iconCls:"icon_save",
					handler:function(b){
						var view = b.up("auth_type_edit");
						var form = view.form;
						if (form.isValid()){
							form.updateRecord(form.currentRecord);
							var data=form.getFieldValues();
							if (form.findField("auth_type").isDisabled()){
								form.findField("auth_type").setDisabled(false)
								data = form.getFieldValues()
								form.findField("auth_type").setDisabled(true)
							}
							view.fireEvent("auth_type_save",{
								src:view,
								model:form.currentRecord,
								values:data
							});	
						}
					}
				},{
					text:"Delete",
					iconCls:"icon_delete",
					action:"delete"
				}],
				
				initComponent:function(){
					var m =new App.model.AuthType();

					this.items=[];	
					
					this.callParent(arguments);
					this.on("beforegridload",function (fp,record) {
						fp.removeAll(false);
						fp.add(appVars.authAdapters[record.data.adapter].items
							.concat([{
								xtype:"displayfield",
								name:"errors",
								hidden:true,
								fieldLabel:"Connection Errors",
								style:"color:red",
								width:300
							}]))
						if (record.data.auth_type){//existing
							fp.body.mask("Loading...")
							$FP.AuthType.get({id:record.data.auth_type},function (result) {
								fp.form.setValues(result)
								var subvalues={}

								$O(result).forEach(function (v,k) {
									if (typeof v =="object"){
										$O(v).forEach(function (sub_v,sub_k) {
											var key= "{0}/{1}".format(k,sub_k)
											subvalues[key]	=sub_v
										})
										
									}
								})

								fp.form.setValues(subvalues)

								fp.body.unmask()
							})
							fp.form.findField("auth_type").setDisabled(true)
						}
						//record.data={}
						return false
						
							
					})
				}
			});	
		/* ----------- auth_type_grid ------------------------------------------------- */
			Ext.define('App.view.auth_type.Grid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.auth_type_grid',
				stripeRows:true,
				store:{
					storeId:"auth_type_grid",
					autoLoad:true,
					type:"authtype",
					remoteSort:false,
					sorters:[{
						property:"name",
						direction:"asc"
					}]
				},
				selModel:{
					xtype:"cellmodel"
				}, 
				tbar:[{
					fieldLabel:"Add new AuthType of",
					labelWidth:120,
					xtype:"quickdrop",
					values:appVars.authAdapterNames,
					editable:false,
					listeners:{
						select:function(c,r){
							var view=c.up("auth_type_grid");
							view.fireEvent("add_auth_type",{
								src:view,
								adapter:r.first().data.value
							});
							view.showEditForm({
								adapter:r.first().data.value
							})
							c.setValue("")

						}	
					}
				}],
				filterPosition:"top",
				filterMode:"local",
				filterSuppressTitle:true,
				editFormConfig:{
					xtype:"auth_type_edit",
					//editTriggerCol:"Name",
					position:"right"
				},
				loadMask: true,
				initComponent:function(){
					var m = new App.model.AuthType();
					var er =function(val){
						return '<div class="link" title="Click to edit this AuthType">'+val+'</div>';
					};
					this.columns=[
						{dataIndex:"auth_type", width:200,renderer:er},
						{dataIndex:"adapter"},
						{dataIndex:"prettyName"},
						{dataIndex:"desc", flex:1 ,minWidth:100}
					].map(function(col){
						return $O(col).setDefaultProperties({
							header:m.getLabel(col.dataIndex),
							//filterable:true,
							//id:col.dataIndex,
							flex:0
						});
					});
						
					this.callParent(arguments);
				}
			});
/* =========== Right ======================================================== */
	/* ----------- Controller ----------------------------------------------- */
		controllers.push("Right");
		Ext.define('App.controller.Right', {
			extend: 'Ext.app.Controller',
			init: function() {
				this.control({
					/*viewport:{
						manage_rights:function () {
							this.showRights();
						}
					},*/
					right_form:{
						save_right:function (event) {
							this.saveRight(event.model,function (result) {
								if (!result.success){
									event.src.form.markInvalid(result.errors);
								} else {
									U.infoMsg("Right saved.")
									event.src.close()
									//event.src.form.loadRecord(event.model);
								}
							})
						},
						
						remove_right:function (event) {
							this.removeRight(event.model.get("right_id"),function (result) {
								if (result.success){
									U.infoMsg("Right deleted.")
								} else {
									alert(result.errorDetail)
								}
								event.src.form.close();
								event.src.supagrid.getStore().load()
							})
						}

					},
					right_grid:{
						
					}

					
				});
			},
			
			saveRight:function (model,cb) {
				$FP.Right.save(model.data,function (result) {
					if (result.success){
						model.set(result.data);
						model.commit();

					} else{
						model.reject();
					}
					cb(result)
				})
			},
			
			removeRight:function (model,cb) {
				$FP.Right.remove({id:model},function (result) {
					if (result.success && model.stores){
						model.stores.forEach(function (store) {
							store.remove(model)
						})
					}
					cb(result)
				})
			}
		})
	/* =========== Views ==================================================== */
		/* ----------- right_grid ----------------------------------------- */
			Ext.define('App.view.RightGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.right_grid',
				
				initComponent:function () {
					var fireSearchEvent = function (trigger) {
						var view = trigger.up("right_grid")
						view.fireEvent("search",{
							src:view,
							value:trigger.getValue()
						})
					}
					Ext.apply(this,{
						itemId:"rights",
						iconCls:"icon_manage_rights",
						store:{
							type:"right"
						},
						columns:[
							{dataIndex:"right_id", renderer:U.linkRenderer, filterable:false},
							{dataIndex:"appname" },
							{dataIndex:"name",width:250 },
							{dataIndex:"description", flex:1 }
							
						].map(function (row) {
							return Ext.applyIf(row,{
								text:App.model.Right.fields[row.dataIndex].label,
								filterable:true
								
							})
						}),
						//filterAutoLoad:true,
						filterSuppressTitle:true,
						paged:true,
						tbar:[{
							text:"Add Right",
							iconCls:"icon_add",
							handler:function (btn) {
								var view = btn.up("right_grid")
								view.showEditForm()
							}
						}],
						editFormConfig:{
							xtype:"right_form",
							editTriggerCol:"right_id",
							position:"right"
						}
					})
					this.callParent(arguments);
					this.on("activate",function (argument) {
						if (this.store.loaded){
							this.store.load()
						} else {
							this.loadFirstPage()
						}
					})
					
				}
			})
		/* ----------- right_form ----------------------------------------- */
			Ext.define('App.view.RightForm', {
				extend: 'Ext.form.Panel',
				alias:'widget.right_form',

				initComponent:function () {
					Ext.apply(this,{
						xtype:"tabpanel",
						autoScroll:true,
						iconCls:"icon_manage_rights",
						frame:true,
						items:[
							{ name:"right_id", xtype:"displayfield" },
							{name:"appname" },
							{name:"name" },
							{name:"description", xtype:"textarea"}
						].map(function (row) {
							var f = App.model.Right.fields[row.name];
							return Ext.applyIf(row,{
								fieldLabel:f.label,
								xtype:(f.jsType == "date")
									?"datefield"
									:(f.jsType == "numeric")
										?"numberfield"
										:"textfield"
								
							})
						}),
						buttons:[{
							text:"Save",
							iconCls:"icon_save",
							handler:function (btn) {
								var view = btn.up("right_form")
								var form = view.form;
								if (!form.isValid()) return;
								var model = view.form.currentRecord;
								form.updateRecord(model);

								view.fireEvent("save_right",{
									src:view,
									model:model
								})
							}
						},{
							text:"Remove",
							iconCls:"icon_delete",
							handler:function (btn) {
								var view = btn.up("right_form");
								var form = view.form;
								
								var model = view.form.currentRecord;
								if (confirm("Delete this right?")){
									view.fireEvent("remove_right",{
										src:view,
										model:model
									})	
								}
								
							}
						},{
							text:"Cancel",
							iconCls:"icon_cancel",
							handler:function (btn) {
								var form = btn.up("right_form").form
								//if inside supagrid
								if (form.close) form.close();
							}
						}]
					})
					this.callParent(arguments);
					var $this=this;
					
				}
			})
		
/* =========== User ========================================================= */
	/* ----------- Controller ----------------------------------------------- */
		controllers.push("User");
		Ext.define('App.controller.User', {
			extend: 'Ext.app.Controller',
			init: function() {
				this.control({
					/*viewport:{
						manage_users:function () {
							this.showUsers();
						}
					},*/
					user_form:{
						save_user:function (event) {
							this.saveUser(event.model,function (result) {
								if (!result.success){
									event.src.form.markInvalid(result.errors);
								} else {
									U.infoMsg("User saved.")
									event.src.form.loadRecord(event.model);
									event.src.down("user_login_grid")
										.setUserId(event.model.get("user_id"))
								}
							})
						},
						reactivate_user:function (event) {
							this.reactivateUser(event.model.get("user_id"),function (result) {
								if (result.success){
									U.infoMsg("User reactivated.")
								} else {
									alert(result.errorDetail)
								}
								event.src.form.close();
								event.src.supagrid.getStore().load()
							})
						},
						deactivate_user:function (event) {
							this.deactivateUser(event.model.get("user_id"),function (result) {
								if (result.success){
									U.infoMsg("User deactivated.")
								} else {
									alert(result.errorDetail)
								}
								event.src.form.close();
								event.src.supagrid.getStore().load()
							})
						}

					},
					user_grid:{
						add_user:function (event) {
							this.showAddLogin(event)
						},
						search:function (event) {
							var store= event.src.getStore();
							if (!store.getProxy.extraParams) store.getProxy.extraParams = {}
							store.getProxy().extraParams.search =event.value
							event.src.loadFirstPage();
						}
					},
					user_login_grid:{
						add_login:function (event) {
							this.showAddLogin(event)
						}
					},
					user_login_form:{
						
						save_login:function (event) {
							this.saveUserLogin(event.model,function (result) {
								if (!result.success){
									event.src.form.markInvalid(result.errors);
								} else {
									U.infoMsg("Login saved.")
									event.src.form.close();
								}
							})
						},
						remove_login:function (event) {
							this.removeUserLogin(event.model,function (result) {
								if (!result.success){
									alert(result.detail)
								} else {
									U.infoMsg("Login removed.")
									event.src.form.close();
								}
							})
						}
					},
					user_login_add:{
						add_user:function (event) {
							this.addUserFromAuthType(event);
						},
						search:function (event) {
							var grid =event.src.down("supagrid")
							var store = grid.getStore();
							/*var proxy = store.getProxy();
							proxy.extraParams = {
								
							}*/
							store.load({
								params:{
									type:event.src.auth_type,
									search:event.value
								}
							})
						}
					}

					
				});
			},
			addUserFromAuthType:function (event) {
				var vp = Ext.ComponentQuery.query("viewport").first();
				var userGrid = vp.down("supagrid[itemId=users]")
				$FP.User.addUserFromAdapter({
					type:event.type,
					login:event.login,
					user_id:event.user_id
				},function (result) {
					if (result.success){
						var mArray = userGrid.getStore().add(result.user)
						userGrid.showEditForm(mArray[0])
						/*userGrid.fireEvent("search",{
							src:userGrid,
							value:result.user.user_id
						})*/
						U.infoMsg("User/Login added")
						event.src.close()
					} else alert(result.detail)
				})
			},
			showAddLogin:function (event) {
				/*if (event.type == "server_admin") {
					U.infoMsg("Assigning Myna Server Admin login is not allowed")
				} else */
				if (event.type == "myna") {
					if (event.user_id){
						event.src.showEditForm({user_id:event.user_id,type:"myna"})
					} else {
						event.src.showEditForm()
					}

				} else {
					Ext.widget("user_login_add",{auth_type:event.type,user_id:event.user_id})
				}

			},
			showUsers:function () {
				U.addCenterTab({
					id:"vUsersGrid",
					xtype:"user_grid",
					title:"Manage Users"
				})
			},
			saveUser:function (model,cb) {
				$FP.User.save(model.data,function (result) {
					if (result.success){
						model.set(result.data);
						model.commit();

					} else{
						model.reject();
					}
					cb(result)
				})
			},
			deactivateUser:function (user_id,cb) {
				$FP.User.deactivate({user_id:user_id},cb);
			},
			reactivateUser:function (user_id,cb) {
				$FP.User.reactivate({user_id:user_id},cb);
			},
			saveUserLogin:function (model,cb) {
				$FP.UserLogin.save(model.data,function (result) {
					if (result.success){
						model.set(result.data);
						model.commit();

					} else{
						model.reject();
					}
					cb(result)
				})
			},
			removeUserLogin:function (model,cb) {
				$FP.UserLogin.remove(model.data,function (result) {
					if (result.success){
						model.stores.forEach(function (store) {
							store.remove(model)
						})
					}
					cb(result)
				})
			}
		})
	/* =========== Views ==================================================== */
		/* ----------- user_grid ----------------------------------------- */
			Ext.define('App.view.UserGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.user_grid',
				
				initComponent:function () {
					var fireSearchEvent = function (trigger) {
						var view = trigger.up("user_grid")
						view.fireEvent("search",{
							src:view,
							value:trigger.getValue()
						})
					}
					Ext.apply(this,{
						itemId:"users",
						iconCls:"icon_manage_users",
						store:{
							type:"user"
						},
						viewConfig: {
							//Return CSS class to apply to rows depending upon data values
							getRowClass: function(record, index) {
								if (record.get("inactive_ts")){
									return "row_inactive"
								} else {
									return ""
								}
							}
						},
						columns:[
							{dataIndex:"user_id", renderer:U.linkRenderer},
							{dataIndex:"first_name" },
							{dataIndex:"middle_name" },
							{dataIndex:"last_name" },
							{dataIndex:"title" },
							{dataIndex:"dob" },
							{dataIndex:"country" },
							{dataIndex:"email"},
							{dataIndex:"gender" },
							{dataIndex:"language" },
							{dataIndex:"nickname" },
							{dataIndex:"postcode" },
							{dataIndex:"timezone" },
							{dataIndex:"created" },
							{dataIndex:"inactive_ts",
								renderer:function(val,meta){

								} 
							}
						].map(function (row) {
							return Ext.applyIf(row,{
								text:App.model.User.fields[row.dataIndex].label
								
							})
						}),
						//filterAutoLoad:true,
						//filterSuppressTitle:true,
						paged:true,
						tbar:[{
							xtype:"trigger",
							fieldLabel:"Search Users",
							onTriggerClick:function () {
								fireSearchEvent(this);
							},
							triggerBaseCls:"x-form-search-trigger x-form-trigger",
							enableKeyEvents:true,
							listeners:{
								keydown:function (trigger,e) {
									if (e.keyCode == 13){
										fireSearchEvent(trigger);			
									}
								}
							}
						},/*{
							text:"Add User",
							iconCls:"icon_add",
							handler:function (btn) {
								var view = btn.up("user_grid")
								view.showEditForm()
							}
						}*/
						{
								xtype:"combo",
								fieldLabel:"Add User",
								labelWidth:60,
								width:250,
								store:{
									type:"direct",
									directFn:$FP.UserLogin.getAuthTypes,
									fields:[
										"auth_type",
										"prettyName"
									],
									autoLoad:true
								},
								displayField:"prettyName",
								valueField:"auth_type",
								queryMode:"local",
								editable:false,
								listeners:{
									select:function (combo, records) {
										if (!records.length) return;
										var type = records[0].get("auth_type");
										var view = combo.up("user_grid")
										view.fireEvent("add_user",{
											src:view,
											type:type
										})
										combo.setValue("")
									}
								}
							}],
						editFormConfig:{
							xtype:"user_form",
							editTriggerCol:"user_id",
							position:"right"
						}
					})
					this.callParent(arguments);
					this.on("activate",function (argument) {
						if (this.store.loaded){
							this.store.load()
						} else {
							this.loadFirstPage()
						}
					})
				}
			})
		/* ----------- user_form ----------------------------------------- */
			Ext.define('App.view.UserForm', {
				extend: 'Ext.form.Panel',
				alias:'widget.user_form',

				initComponent:function () {
					Ext.apply(this,{
						xtype:"tabpanel",
						autoScroll:true,
						iconCls:"icon_manage_users",
						frame:true,
						items:[
							{ name:"user_id", xtype:"displayfield" },
							{ name:"first_name" },
							{ name:"middle_name" },
							{ name:"last_name" },
							{ name:"title" },
							{ name:"dob" },
							{ name:"country" },
							{ name:"email" },
							{ name:"gender" },
							{ name:"language" },
							{ name:"nickname" },
							{ name:"postcode" },
							{ name:"timezone" },
							{ name:"created", 
								xtype:"displayfield", 
								setValue:function (date){
									if (!date) return
									this.setRawValue(
										date.format("m/d/Y H:i:s")
									)
								}
							},
							{ name:"inactive_ts", 
								xtype:"displayfield",
								setValue:function (date){
									if (!date) return
									this.setRawValue(
										date.format("m/d/Y H:i:s")
									)
								}
							}
						].map(function (row) {
							var f = App.model.User.fields[row.name];
							return Ext.applyIf(row,{
								fieldLabel:f.label,
								xtype:(f.jsType == "date")
									?"datefield"
									:(f.jsType == "numeric")
										?"numberfield"
										:"textfield"
								
							})
						}).concat([{
							xtype:"user_login_grid",
							title:"Logins:",
							user_id:"--------------------",
							height:150,
							width:260
						}]),
						buttons:[{
							text:"Save",
							iconCls:"icon_save",
							handler:function (btn) {
								var view = btn.up("user_form")
								var form = view.form;
								if (!form.isValid()) return;
								var model = view.form.currentRecord;
								form.updateRecord(model);

								view.fireEvent("save_user",{
									src:view,
									model:model
								})
							}
						},{
							text:"Deactivate",
							itemId:"deactivate_button",
							iconCls:"icon_delete",
							handler:function (btn) {
								var view = btn.up("user_form");
								var form = view.form;
								
								var model = view.form.currentRecord;
								if (confirm("Deactivate this user?")){
									view.fireEvent("deactivate_user",{
										src:view,
										model:model
									})	
								}
								
							}
						},{
							text:"Reactivate",
							itemId:"reactivate_button",
							iconCls:"icon_add",
							handler:function (btn) {
								var view = btn.up("user_form")
								var form = view.form;
								
								var model = view.form.currentRecord;
								view.fireEvent("reactivate_user",{
									src:view,
									model:model
								})
							}
						},{
							text:"Cancel",
							iconCls:"icon_cancel",
							handler:function (btn) {
								var form = btn.up("user_form").form
								//if inside supagrid
								if (form.close) form.close();
							}
						}]
					})
					this.callParent(arguments);
					var $this=this;
					
					this.addListener("beforegridload",function (fp,record) {

						this.down("user_login_grid").setUserId(record.get("user_id"));

						if (record.get("inactive_ts")){
							fp.down("*[itemId=reactivate_button]").show();
							fp.down("*[itemId=deactivate_button]").hide();
						} else {
							fp.down("*[itemId=reactivate_button]").hide();
							fp.down("*[itemId=deactivate_button]").show();
						}
					})
				}
			})
		/* ----------- user_login_grid ----------------------------------------- */
			Ext.define('App.view.UserLoginGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.user_login_grid',
				
				initComponent:function () {
					var $this = this;
					
					Ext.apply(this,{
						iconCls:"icon_manage_users",
						store:{
							type:"userlogin"
						},
						columns:[
							{dataIndex:"user_id",hidden:true},
							{dataIndex:"user_login_id", hidden:true},
							{dataIndex:"login"},
							{dataIndex:"type"}
						].map(function (row) {
							return Ext.applyIf(row,{
								text:App.model.UserLogin.fields[row.dataIndex].label
								
							})
						}),
						//filterAutoLoad:true,
						//filterSuppressTitle:true,
						//paged:true,
						tbar:[{
								xtype:"combo",
								fieldLabel:"Add Login",
								width:250,
								labelWidth:60,
								store:{
									type:"direct",
									directFn:$FP.UserLogin.getAuthTypes,
									fields:[
										"auth_type",
										"prettyName"
									],
									autoLoad:true
								},
								displayField:"prettyName",
								valueField:"auth_type",
								queryMode:"local",
								editable:false,
								listeners:{
									select:function (combo, records) {
										if (!records.length) return;
										var type = records[0].get("auth_type");
										var view = combo.up("user_login_grid")
										view.fireEvent("add_login",{
											src:view,
											user_id:$this.user_id,
											type:type
										})
										combo.setValue("")
									}
								}
							}],
						editFormConfig:{
							title:"Edit Login",
							xtype:"user_login_form"/*,
							position:"bottom"*/
						}
					})
					
					this.callParent(arguments);
					this.setUserId = function (user_id) {
						if (!user_id) return;
						this.user_id = user_id;
						this.getStore().getProxy().extraParams={
							user_id:user_id
						}
						//this.loadFirstPage();
						this.getStore().load();
					}
					
				}

			})
		/* ----------- user_login_form ----------------------------------------- */
			Ext.define('App.view.UserLoginForm', {
				extend: 'Ext.form.Panel',
				alias:'widget.user_login_form',
				
				initComponent:function () {
					Ext.apply(this,{
						autoScroll:true,
						iconCls:"icon_manage_users",
						frame:true,
						items:[
							//{name:"user_id", xtype:"displayfield"},
							//{name:"user_login_id", xtype:"displayfield"},
							{name:"login"},
							{name:"password", inputType: 'password', emptyText:"Password Hidden"},

							{name:"type", 
								xtype:"combo",
								disabled:true,
								store:{
									type:"direct",
									directFn:$FP.UserLogin.getAuthTypes,
									fields:[
										"auth_type",
										"prettyName"
									],
									autoLoad:true
								},
								displayField:"prettyName",
								valueField:"auth_type",
								queryMode:"local",
								editable:false
							}/*,
							{xtype:"displayfield", 
								fieldLabel:"Note",
								value:"LDAP and Myna Server Administrator <br> logins do not use the password field"
							}*/
						].map(function (row) {
							if (!row.name) return row
							var f = App.model.UserLogin.fields[row.name];
							return Ext.applyIf(row,{
								fieldLabel:f.label,
								xtype:(f.jsType == "date")
									?"datefield"
									:(f.jsType == "numeric")
										?"numberfield"
										:"textfield"
								
							})
						}),
						buttons:[{
							text:"Save",
							iconCls:"icon_save",
							handler:function (btn) {
								var view = btn.up("user_login_form")
								var form = view.form;
								if (!form.isValid()) return;
								var model = view.form.currentRecord;
								form.updateRecord(model);

								view.fireEvent("save_login",{
									src:view,
									model:model
								})
							}
						},{
							text:"Delete",
							iconCls:"icon_delete",
							handler:function (btn) {
								var view = btn.up("user_login_form");
								var model = view.form.currentRecord;
								if (confirm("Delete this login?")){
									view.fireEvent("remove_login",{
										src:view,
										model:model
									})	
								}
								
							}
						},{
							text:"Cancel",
							iconCls:"icon_cancel",
							handler:function (btn) {
								var form = btn.up("user_login_form").form
								//if inside supagrid
								if (form.close) form.close();
							}
						}]
					})
					this.callParent(arguments);
					var $this=this;
					this.addListener("beforegridload",function (fp,record) {
						if(record.get("type") != "myna") {
							fp.form.findField("password").hide();
						}
						if(record.get("type") == "server_admin") {
							U.infoMsg("Myna Server Admin logins are not editable")
							setTimeout(function () {fp.close()},0)
						}
					})
				}
			})
		/* ----------- user_login_add ----------------------------------------- */
			Ext.define('App.view.UserLoginAdd', {
				extend: 'Ext.window.Window',
				alias:'widget.user_login_add',
				title:"Add Login",
				autoShow:true,
				width:800,
				height:600,
				layout:"fit",
				//modal:true,
				initComponent:function () {
					var fireSearchEvent = function (trigger) {
						var view = trigger.up("user_login_add")
						view.fireEvent("search",{
							src:view,
							value:trigger.getValue()
						})
					}
					var $this= this;
					Ext.apply(this,{
						//frame:true,
						items:[{
							//xtype::"form",
							xtype:"supagrid",
							store:{
								type:"direct",
								directFn:$FP.UserLogin.searchByAuthType,
								fields:[
									"login",
									"first_name",
									"last_name",
									"middle_name",
									"email",
									"title"
								]
							},
							loadMask:true,
							columns:[

								{dataIndex:"login", renderer:U.linkRenderer},
								{dataIndex:"first_name"},
								{dataIndex:"last_name"},
								{dataIndex:"middle_name"},
								{dataIndex:"email"},
								{dataIndex:"title", flex:1}
							].map(function (row) {
								row.text = row.dataIndex.replace(/_/g," ").titleCap()
								return row
							}),
							tbar:[{
								xtype:"trigger",
								fieldLabel:"Search for login",
								onTriggerClick:function () {
									fireSearchEvent(this);
								},
								triggerBaseCls:"x-form-search-trigger x-form-trigger",
								enableKeyEvents:true,
								listeners:{
									keydown:function (trigger,e) {
										if (e.keyCode == 13){
											fireSearchEvent(trigger);			
										}
									}
								}
							}],
							listeners:{
								itemclick:function (grid, record) {
									var view= grid.up("user_login_add");
									view.fireEvent("add_user",{
										src:view,
										type:view.auth_type,
										login:record.get("login"),
										user_id:$this.user_id
									})
								}
							}
						}]
					})
					this.callParent(arguments);
					
				}
			})
/* =========== Group ======================================================== */
	/* ----------- Controller ----------------------------------------------- */
		controllers.push("Group");
		Ext.define('App.controller.Group', {
			extend: 'Ext.app.Controller',
			init: function() {
				this.control({
					viewport:{
						manage_user_groups:function () {
							this.showGroups();
						}
					},
					group_form:{
						remove_group:function (event) {
							this.removeGroup(event.model,function (result) {
								if (result.success){
									
									U.infoMsg("group removed.")
									event.src.form.close()
								}
							})
						},
						save_group:function (event) {
							this.saveGroup(event.model,function (result) {
								if (!result.success){
									event.src.form.markInvalid(result.errors);
								} else {
									U.infoMsg("group saved.")
									event.src.form.loadRecord(event.model);
									event.src.down("group_users_grid")
										.setGroupId(event.model.get("group_id"))
									event.src.down("group_rights_grid")
										.setGroupId(event.model.get("group_id"))
								}
							})
						}
					},
					group_add:{
						add_group:function (event) {
							this.addGroupFromAuthType(event);
						},
						search:function (event) {
							var grid =event.src.down("supagrid")
							var store = grid.getStore();
							/*var proxy = store.getProxy();
							proxy.extraParams = {
								
							}*/
							store.load({
								params:{
									type:event.src.auth_type,
									search:event.value
								}
							})
						}
					},
					group_grid:{
						add_group:function (event) {
							this.showAddGroup(event)
						},
						sync_groups:function (event) {
							U.infoMsg("Remote sync starting...")
							this.syncGroups(function(result){
								if (result.success){
									U.infoMsg("Remote Auth groups synchronized")
								}
							});
						},
						search:function (event) {
							var store= event.src.getStore();
							if (!store.getProxy.extraParams) store.getProxy.extraParams = {}
							store.getProxy().extraParams.search =event.value
							event.src.loadFirstPage();
						}
					},
					group_users_grid:{
						show_add_user:function (event) {
							Ext.widget("group_user_add",{
								userGrid:event.src
							})
						},
						remove_user:function (user_id,model,col,grid) {
							var msg="Remove user {first_name} {last_name} from this group?".format(
								model.data
							)
							if (confirm(msg)){
								this.removeUser(user_id,grid.user_group_id,function (result) {
									if (result.success && model.stores){
										model.stores.forEach(function (store) {
											store.remove(model)
										})
									}				
								})
							}
						}
						
					},
					group_user_add:{
						add_user:function (event) {
							this.addUser(
								event.models.items.map(function (model) {
									return model.data.user_id
								}).join(),
								event.userGrid.user_group_id,
								function (result) {
									if (result.success){
										event.models.items.forEach(function (model) {
											event.userGrid.getStore().add(model);	
										})
										event.src.close();
									}
								}
							)
						}
					},
					group_subgroups_grid:{
						show_add_subgroup:function (event) {
							Ext.widget("group_subgroup_add",{
								groupGrid:event.src
							})
						},
						remove_subgroup:function (user_group_id,model,col,grid) {
							var msg="Remove subgroup {name} from this group?".format(
								model.data
							)
							if (confirm(msg)){
								this.removeSubGroup(user_group_id,grid.user_group_id,function (result) {
									if (result.success && model.stores){
										model.stores.forEach(function (store) {
											store.remove(model)
										})
									}				
								})
							}
						}
						
					},
					group_subgroup_add:{
						add_subgroup:function (event) {
							this.addSubGroup(
								event.models.items.map(function (model) {
									return model.data.user_group_id
								}).join(),
								event.groupGrid.user_group_id,
								function (result) {
									if (result.success){
										event.models.items.forEach(function (model) {
											event.groupGrid.getStore().add(model);	
										})
										event.src.close();
									}
								}
							)
						}
					},
					group_rights_grid:{
						show_add_right:function (event) {
							Ext.widget("group_right_add",{
								rightGrid:event.src
							})
						},
						remove_right:function (right_id,model,col,grid) {
							var msg="Remove right {appname}/{name} from this group?".format(
								model.data
							)
							if (confirm(msg)){
								this.removeRight(right_id,grid.user_group_id,function (result) {
									if (result.success && model.stores){
										model.stores.forEach(function (store) {
											store.remove(model)
										})
									}				
								})
							}
						}
						
					},
					group_right_add:{
						add_right:function (event) {
							this.addRight(
								event.models.items.map(function (model) {
									return model.data.right_id
								}).join(),
								event.rightGrid.user_group_id,
								function (result) {
									if (result.success){
										event.models.items.forEach(function (model) {
											event.rightGrid.getStore().add(model);	
										})
										
										event.src.close();
									}
								}
							)
						}
					}
				});
			},	
			
			addGroupFromAuthType:function (event) {
				event.src.body.mask("importing...");
				var vp = Ext.ComponentQuery.query("viewport").first();
				var groupGrid = vp.down("supagrid[itemId=groups]")
				$FP.UserGroup.addGroupFromAdapter({
					type:event.type,
					name:event.name,
					id:event.id
				},function (result) {
					event.src.body.unmask();
					if (result.success){
						var mArray = groupGrid.getStore().add(result.group)
						groupGrid.showEditForm(mArray[0])
						/*groupGrid.fireEvent("search",{
							src:groupGrid,
							value:result.user.user_id
						})*/
						U.infoMsg("Group added")
						event.src.close()
					} else alert(result.detail)
				})
			},
			
			showAddGroup:function (event) {
				/*if (event.type == "server_admin") {
					U.infoMsg("Assigning Myna Server Admin login is not allowed")
				} else */
				if (event.type == "myna") {
					if (event.user_id){
						event.src.showEditForm({user_id:event.user_id,type:"myna"})
					} else {
						event.src.showEditForm()
					}

				} else {
					Ext.widget("group_add",{auth_type:event.type,user_id:event.user_id})
				}

			},
			showGroups:function () {
				U.addCenterTab({
					id:"vGroupsGrid",
					xtype:"group_grid",
					title:"Manage Groups"
				})
			},
			syncGroups:function(cb) {
				$FP.UserGroup.syncGroups({},cb)
			},
			removeGroup:function (model,cb) {
				$FP.UserGroup.remove(model.data,function (result) {
					if (result.success && model.stores){
						model.stores.forEach(function (store) {
							store.remove(model)
						})
					}
					cb(result)
				})
			},
			saveGroup:function (model,cb) {
				$FP.UserGroup.save(model.data,function (result) {
					if (result.success){
						model.set(result.data);
						model.commit();

					} else{
						model.reject();
					}
					cb(result)
				})
			},
			removeUser:function (user_id,user_group_id,cb) {
				$FP.UserGroup.removeUser({
					user_id:user_id,
					user_group_id:user_group_id
				},function (result) {
					
					cb(result)
				})
			},
			addUser:function (user_id,user_group_id,cb) {
				$FP.UserGroup.addUser({
					user_id:user_id,
					user_group_id:user_group_id
				},cb)
			},
			removeSubGroup:function (subgroup_id,user_group_id,cb) {
				$FP.UserGroup.removeSubGroup({
					subgroup_id:subgroup_id,
					user_group_id:user_group_id
				},function (result) {
					
					cb(result)
				})
			},
			addSubGroup:function (subgroup_id,user_group_id,cb) {
				$FP.UserGroup.addSubGroup({
					user_group_id:user_group_id,
					subgroup_id:subgroup_id
				},cb)
			},
			removeRight:function (right_id,user_group_id,cb) {
				$FP.UserGroup.removeRight({
					right_id:right_id,
					user_group_id:user_group_id
				},function (result) {
					
					cb(result)
				})
			},
			addRight:function (right_id,user_group_id,cb) {
				$FP.UserGroup.addRight({
					right_id:right_id,
					user_group_id:user_group_id
				},cb)
			}
		})
	/* =========== Views ==================================================== */
		/* ----------- group_grid ----------------------------------------- */
			Ext.define('App.view.GroupGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.group_grid',
				title:"Manage Groups",
				/*
					user_group_id,
					name,
					appname,
					description
				*/
				initComponent:function () {
					var fireSearchEvent = function (trigger) {
						var view = trigger.up("group_grid")
						view.fireEvent("search",{
							src:view,
							value:trigger.getValue()
						})
					}
					Ext.apply(this,{
						itemId:"groups",
						iconCls:"icon_manage_user_groups",
						store:{
							type:"usergroup"
						},
						viewConfig: {
							//Return CSS class to apply to rows depending upon data values
							getRowClass: function(record, index) {
								if (record.get("inactive_ts")){
									return "row_inactive"
								} else {
									return ""
								}
							}
						},
						columns:[
							{dataIndex:"user_group_id", renderer:U.linkRenderer},
							{dataIndex:"name",flex:1, filterable:true},
							{dataIndex:"appname",
								width:200, 
								filterable:true
								
							},
							{dataIndex:"description", flex:2, filterable:true}
						].map(function (row) {
							return Ext.applyIf(row,{
								text:App.model.UserGroup.fields[row.dataIndex].label
								
							})
						}),
						//filterAutoLoad:true,
						filterSuppressTitle:true,
						paged:true,
						tbar:[{
							xtype:"combo",
							fieldLabel:"Add Group",
							labelWidth:60,
							width:250,
							store:{
								type:"direct",
								directFn:$FP.UserLogin.getAuthTypes,
								fields:[
									"auth_type",
									"prettyName"
								],
								autoLoad:true
							},
							displayField:"prettyName",
							valueField:"auth_type",
							queryMode:"local",
							editable:false,
							listeners:{
								select:function (combo, records) {
									if (!records.length) return;
									var type = records[0].get("auth_type");
									var view = combo.up("group_grid")
									view.fireEvent("add_group",{
										src:view,
										type:type
									})
									combo.setValue("")
								}
							}
						},{
							text:"Re-import synced groups",
							iconCls:"icon_adapter",
							handler:function(c){
								var view=c.up("group_grid");
								view.fireEvent("sync_groups",{
									src:view
								});
							}
						}],
						editFormConfig:{
							xtype:"group_form",
							position:"right"
						}
					})
					this.callParent(arguments);
					this.on("activate",function (argument) {
						if (this.store.loaded){
							this.store.load()
						} else {
							this.loadFirstPage()
						}
					})
				}
			})
		/* ----------- group_form ------------------------------------------ */
			Ext.define('App.view.groupForm', {
				extend: 'Ext.form.Panel',
				alias:'widget.group_form',
				width:600,
				frame:true,
				initComponent:function () {
					Ext.apply(this,{
						layout:{
							type:"vbox",
							align:"stretch"
						},
						items:[
							{ name:"user_group_id", xtype:"displayfield" },
							{ name:"name" },
							{ name:"appname" },
							{ name:"description", xtype:"textarea" }
						].map(function (row) {
							var f = App.model.UserGroup.fields[row.name];
							return Ext.applyIf(row,{
								fieldLabel:f.label,
								anchor:"100%",
								xtype:(f.jsType == "date")
									?"datefield"
									:(f.jsType == "numeric")
										?"numberfield"
										:"textfield"
								
							})
						}).concat([{
							xtype:"tabpanel",
							flex:1,

							items:[{
								title:"Users",
								xtype:"group_users_grid",
								autoScroll:true,
								iconCls:"icon_manage_users",
								frame:true
								
							},{
								title:"Sub-Groups",
								xtype:"group_subgroups_grid",
								autoScroll:true,
								iconCls:"icon_manage_groups",
								frame:true
								
							},{
								title:"Rights",
								xtype:"group_rights_grid",
								autoScroll:true,
								iconCls:"icon_manage_rights",
								frame:true
								
							}]
						}]),
						buttons:[{
							text:"Save",
							iconCls:"icon_save",
							handler:function (btn) {
								var view = btn.up("group_form")
								var form = view.form;
								if (!form.isValid()) return;
								var model = view.form.currentRecord;
								form.updateRecord(model);

								view.fireEvent("save_group",{
									src:view,
									model:model
								})
							}
						},{
							text:"Delete",
							itemId:"deactivate_button",
							iconCls:"icon_delete",
							handler:function (btn) {
								var view = btn.up("group_form");
								var form = view.form;
								
								var model = view.form.currentRecord;
								if (confirm("Delete group '{name}'?".format(model.data))){
									view.fireEvent("remove_group",{
										src:view,
										model:model
									})	
								}
								
							}
						},{
							text:"Cancel",
							iconCls:"icon_cancel",
							handler:function (btn) {
								var form = btn.up("group_form").form
								//if inside supagrid
								if (form.close) form.close();
							}
						}]
					})
					this.callParent(arguments);
					this.addListener("beforegridload",function (fp,record) {

						this.down("group_users_grid").setGroupId(record.get("user_group_id"));
						this.down("group_subgroups_grid").setGroupId(record.get("user_group_id"));
						this.down("group_rights_grid").setGroupId(record.get("user_group_id"));

					})
					
				}
			})		
		/* ----------- group_rights_grid ------------------------------------- */
			Ext.define('App.view.GroupRightsGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.group_rights_grid',
				
				initComponent:function () {
					var $this = this;
					
					Ext.apply(this,{
						iconCls:"icon_manage_rights",
						store:{
							type:"direct",
							directFn:$FP.UserGroup.getRights,
							root:"data",
							fields:[
								"right_id",
								"appname",
								"name",
								"description"
							]
						},
						columns:[
							{dataIndex:"right_id",
								eventName:"remove_right", 
								width:25,
								qtip:"remove this right",
								text:" ",
								renderer:function (val) {
									return '<img src="{0}static/images/delete.png"/>'.format(
										appVars.appUrl
									)
								}
							},
							{dataIndex:"appname" },
							{dataIndex:"name" },
							{dataIndex:"description", flex:1 }
						].map(function (row) {
							return Ext.applyIf(row,{
								//filterable:true,
								text:App.model.Right.fields[row.dataIndex].label
								
							})
						}),
						//filterAutoLoad:true,
						filterSuppressTitle:true,
						//paged:true,
						tbar:[{
							text:"Add Right",
							iconCls:"icon_add",
							handler:function(c){
								var view=c.up("group_rights_grid");
								view.fireEvent("show_add_right",{
									src:view
								});
							}
						}]
						
					})
					
					this.callParent(arguments);
					this.setGroupId = function (user_group_id) {
						if (!user_group_id) return;
						this.user_group_id = user_group_id;
						this.getStore().getProxy().extraParams={
							user_group_id:user_group_id
						}
						//this.loadFirstPage();
						this.getStore().load();
					}
					
				}

			})
		/* ----------- group_right_add --------------------------------------- */
			Ext.define('App.view.GroupRightAdd', {
				extend: 'Ext.window.Window',
				alias:'widget.group_right_add',
				title:"Add Right",
				iconCls:"icon_manage_rights",
				autoShow:true,
				width:1000,
				maximizable:true,
				height:750,
				layout:"fit",
				modal:true,
				initComponent:function () {
					var $this= this;
					Ext.apply(this,{
						//frame:true,
						items:[{
							//xtype::"form",
							xtype:"right_grid",
							selType: 'checkboxmodel',
							selModel: {
								mode: 'MULTI'
							},
							buttons:[{
								iconCls:"icon_manage_rights",
								text:"Add Selected Rights",
								handler:function(c){
									var view=c.up("group_right_add");
									view.fireEvent("add_right",{
										src:view,
										models:view.down("supagrid").getSelectionModel().selected,
										rightGrid:view.rightGrid
									});
								}
							}]
						}]
					})
					this.callParent(arguments);
					this.down("supagrid").loadFirstPage()
					
				}
			})	
		/* ----------- group_users_grid ------------------------------------- */
			Ext.define('App.view.GroupUsersGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.group_users_grid',
				
				initComponent:function () {
					var $this = this;
					
					Ext.apply(this,{
						iconCls:"icon_manage_users",
						store:{
							type:"direct",
							directFn:$FP.UserGroup.getUsers,
							root:"data",
							fields:[
								"user_id",
								"first_name",
								"last_name",
								"email"
							]
						},
						columns:[
							{dataIndex:"user_id",
								eventName:"remove_user", 
								width:25,
								qtip:"remove this user",
								text:" ",
								renderer:function (val) {
									return '<img src="{0}static/images/delete.png"/>'.format(
										appVars.appUrl
									)
								}
							},
							{dataIndex:"first_name", flex:1},
							{dataIndex:"last_name", flex:1},
							{dataIndex:"email", flex:1}
						].map(function (row) {
							return Ext.applyIf(row,{
								//filterable:true,
								text:App.model.User.fields[row.dataIndex].label
								
							})
						}),
						//filterAutoLoad:true,
						filterSuppressTitle:true,
						//filterMode:"local",
						//paged:true,
						tbar:[{
							text:"Add User",
							iconCls:"icon_add",
							handler:function(c){
								var view=c.up("group_users_grid");
								view.fireEvent("show_add_user",{
									src:view
								});
							}
						}]
						
					})
					
					this.callParent(arguments);
					this.setGroupId = function (user_group_id) {
						if (!user_group_id) return;
						this.user_group_id = user_group_id;
						this.getStore().getProxy().extraParams={
							user_group_id:user_group_id
						}
						//this.loadFirstPage();
						this.getStore().load();
					}
					
				}

			})
		/* ----------- group_user_add --------------------------------------- */
			Ext.define('App.view.GroupUserAdd', {
				extend: 'Ext.window.Window',
				alias:'widget.group_user_add',
				title:"Add User",
				iconCls:"icon_manage_users",
				autoShow:true,
				width:1000,
				maximizable:true,
				height:750,
				layout:"fit",
				modal:true,
				initComponent:function () {
					var $this= this;
					Ext.apply(this,{
						//frame:true,
						items:[{
							//xtype::"form",
							xtype:"user_grid",
							selType: 'checkboxmodel',
							selModel: {
								mode: 'MULTI'
							},
							buttons:[{
								iconCls:"icon_add",
								text:"Add Selected Users",
								handler:function(c){
									var view=c.up("group_user_add");
									view.fireEvent("add_user",{
										src:view,
										models:view.down("supagrid").getSelectionModel().selected,
										userGrid:view.userGrid
									});
								}
							}]
						}]
					})
					this.callParent(arguments);
					this.down("supagrid").loadFirstPage()
					
				}
			})	
		/* ----------- group_subgroups_grid ------------------------------------- */
			Ext.define('App.view.GroupSubgroupsGrid', {
				extend: 'univnm.ext.SupaGrid',
				alias:'widget.group_subgroups_grid',
				
				initComponent:function () {
					var $this = this;
					
					Ext.apply(this,{
						iconCls:"icon_manage_users",
						store:{
							type:"direct",
							directFn:$FP.UserGroup.getSubGroups,
							root:"data",
							fields:[
								"user_group_id",
								"name",
								"appname",
								"auth_type"
							]
						},
						columns:[
							{dataIndex:"user_group_id",
								eventName:"remove_subgroup", 
								width:25,
								qtip:"Remove this sub-group",
								text:" ",
								renderer:function (val) {
									return '<img src="{0}static/images/delete.png"/>'.format(
										appVars.appUrl
									)
								}
							},
							{dataIndex:"name", flex:1},
							{dataIndex:"appname", flex:1},
							{dataIndex:"auth_type", flex:1}
						].map(function (row) {
							return Ext.applyIf(row,{
								text:App.model.UserGroup.fields[row.dataIndex].label
							})
						}),
						//filterAutoLoad:true,
						filterSuppressTitle:true,
						//paged:true,
						tbar:[{
							text:"Add Sub-Group",
							iconCls:"icon_add",
							handler:function(c){
								var view=c.up("group_subgroups_grid");
								view.fireEvent("show_add_subgroup",{
									src:view
								});
							}
						}]
						
					})
					
					this.callParent(arguments);
					this.setGroupId = function (user_group_id) {
						if (!user_group_id) return;
						this.user_group_id = user_group_id;
						this.getStore().getProxy().extraParams={
							user_group_id:user_group_id
						}
						//this.loadFirstPage();
						this.getStore().load();
					}
					
				}

			})
		/* ----------- group_subgroup_add --------------------------------------- */
			Ext.define('App.view.GroupSubgroupAdd', {
				extend: 'Ext.window.Window',
				alias:'widget.group_subgroup_add',
				title:"Add User",
				iconCls:"icon_manage_users",
				autoShow:true,
				width:1000,
				maximizable:true,
				height:750,
				layout:"fit",
				modal:true,
				initComponent:function () {
					var $this= this;
					Ext.apply(this,{
						//frame:true,
						items:[{
							//xtype::"form",
							xtype:"group_grid",
							selType: 'checkboxmodel',
							selModel: {
								mode: 'MULTI'
							},
							buttons:[{
								iconCls:"icon_add",
								text:"Add Selected Groups",
								handler:function(c){
									var view=c.up("group_subgroup_add");
									view.fireEvent("add_subgroup",{
										src:view,
										models:view.down("supagrid").getSelectionModel().selected,
										groupGrid:view.groupGrid
									});
								}
							}]
						}]
					})
					this.callParent(arguments);
					this.down("supagrid").loadFirstPage()
					
				}
			})	
		/* ----------- group_add -------------------------------------------- */
			Ext.define('App.view.GroupAdd', {
				extend: 'Ext.window.Window',
				alias:'widget.group_add',
				title:"Add Group",
				autoShow:true,
				width:800,
				height:600,
				layout:"fit",
				//modal:true,
				initComponent:function () {
					var fireSearchEvent = function (trigger) {
						var view = trigger.up("group_add")
						view.fireEvent("search",{
							src:view,
							value:trigger.getValue()
						})
					}
					var $this= this;
					Ext.apply(this,{
						//frame:true,
						items:[{
							//xtype::"form",
							xtype:"supagrid",
							store:{
								type:"direct",
								directFn:$FP.UserGroup.searchByAuthType,
								fields:[
									"name",
									"id"
								]
							},
							loadMask:true,
							columns:[

								{dataIndex:"name", flex:1, renderer:U.linkRenderer}
							].map(function (row) {
								row.text = row.dataIndex.replace(/_/g," ").titleCap()
								return row
							}),
							tbar:[{
								xtype:"trigger",
								fieldLabel:"Search for group",
								onTriggerClick:function () {
									fireSearchEvent(this);
								},
								triggerBaseCls:"x-form-search-trigger x-form-trigger",
								enableKeyEvents:true,
								listeners:{
									keydown:function (trigger,e) {
										if (e.keyCode == 13){
											fireSearchEvent(trigger);			
										}
									}
								}
							}],
							listeners:{
								itemclick:function (grid, record) {
									var view= grid.up("group_add");
									view.fireEvent("add_group",{
										src:view,
										type:view.auth_type,
										name:record.get("name"),
										id:record.get("id")
									})
								}
							}
						}]
					})
					this.callParent(arguments);
					
				}
			})	
/*  */

/* ----------- Application definition: App ---------------------------------- */
	Ext.application({
		name: 'App',
		controllers:controllers,
		autoCreateViewport:true,
		launch:function(){
			Ext.apply(App,{
				
			})
			/*this.getController("Sql").openSql(
				U.beautifySql(
					'Select aa.answer_attachment_id, aa.request_id, aa.document, aa.filename, aa.title, aa.question_id, aa from "ORS"."ANSWER_ATTACHMENT" aa'
				)
			);*/

			
			
		}
		
	});	
