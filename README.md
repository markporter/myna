Release Name: 1.12.2
============================
Notes: Improved installer, minor bug fixes

* **[ADD]**         $application.appStart property is now set to true inside the application start thread.
* **[ADD]**         Install mode for Myna now prompts for admin password, and pre-encrypts this into the myna config at install time
* **[ADD]**         interactive installer: Calling war file with no options now prompts for install options
* **[CHANGE]**      Cached statements in Myna.Query are now limited to 100. This should prevent "Too Many Cursors" error in Oracle
* **[CHANGE]**      added forceReload option to FlightPath.getControllerNames
* **[FIX]**         fixed AD group import to not try top import null auth types

----------------------------------------------------------
Release Name: 1.12.1
============================
Notes: Bug Fixes

* **[FIX]**         LDAP auth adpater import was creating duplicate users if they did not already have a remote_id set.
* **[FIX]**         upgrade tables was not adding the auth_type column to existing user group table

----------------------------------------------------------
Release Name: 1.12.0
============================
Notes: Bug Fixes and remote auth adapter (Active Directory) improvments

* **[ADD]**         Myna.Ldap now automatically pages through all results of ldap queries against Active Directory
* **[ADD]**         MynaThread.importPreCompiled: allows importing of pre-compiled js classes
* **[ADD]**         Now Pre-compiling core libs into Java classes in libOO.sjs
* **[ADD]**         User.setLogin can now take a third parameter, remote_id. This is the unique ID of the login from the auth source. GetUserByLogin will also search this field so it is possible to find users based on remote source id, such has LDAP DN
* **[ADD]**         added "Re-import synced groups" button to group grid in permissions
* **[ADD]**         libOO can now be run in comiled mode wher pre-loaded classes are used instead of just-in-time compile
* **[ADD]**         Nested groups. Groups can now contain subgroups. These subgroups will be checked for rights, However this will only go one level deep. Subgroups of subgroups will not be checked.
* **[ADD]**         standard_objects.sjs now also uses pre-compiled classes for the standard libs
* **[ADD]**         when running in commandline mode, compiling is disabled and the previously compiled classes are loaded in libOO. This cuts load time in half for commandline mode.
* **[CHANGE]**      DataSet.js now ONLY contains clientside code, and DataSet.sjs contains both client and server side code.
* **[CHANGE]**      Made route logging in FlightPath async
* **[CHANGE]**      Moved static folder from app to root for Myna FlightPath
* **[CHANGE]**      Removed Flightpath processing for /static files
* **[CHANGE]**      Updated H2 db to 1.3.176
* **[CHANGE]**      Updated MynaAdministrator to match new FlightPath static rules
* **[CHANGE]**      When importing groups from auth adapters, user lookups will now only be performed if the user does not already exists under the a login or remote_id. This dramatically speeds group sync in the case where group memberships overlap, or the the groups has previously been imported
* **[CHANGE]**      now recreating the global scope on every call. This is now fast enough with pre-compiled libs
* **[CHANGE]**      removed auth_adapter remote group sync from login process. Replaced with scheduled task every ten minutes
* **[CHANGE]**      removed sealing of global scope, now that it is not shared
* **[FIX]**         error in Date.js in browsers that don't support destructuing assignments
* **[FIX]**         Disabeld Hazelcast Myna.Thread instance in server_start.sjs to avoid "myna not defeind" error messages
* **[FIX]**         Disabled SNI checking due to bad handing of null server names
* **[FIX]**         Fixed weird UTF8 error in postgress when SQL string contains NULL characters
* **[FIX]**         importing groups now only delete the group being imported, not all groups from that auth source

----------------------------------------------------------
Release Name: 1.11.3
============================
Notes: 

* **[FIX]**         error in Date.js in browsers that don't support destructuing assignments
* **[FIX]**         Fixed weird UTF8* error in postgress when SQL string contains NULL characters

----------------------------------------------------------
Release Name: 1.11.2
============================
Notes: Minor feature update

* **[ADD]**         Added Myna.exec for simple system calls
* **[ADD]**         Added String.pipe() to call Myna.exec gain using a previous result as an input
* **[ADD]**         Mail headers support for Myna.Mail
* **[CHANGE]**      Improved support for paged queries in MySql


----------------------------------------------------------
Release Name: undefined
============================
Notes: 

* **[CHANGE]**      Improved support for paged queries in MySql
* **[OTHER]**       "

----------------------------------------------------------Release Name: 1.11.1
============================
Notes: Bug Fixes


* **[FIX]** ldap group searches now only search "group_name" attribute
* **[FIX]** Myna Permissions app regression where user search dialog was opened when adding a group
* **[FIX]** Myna Permissions app now displays errors in ldap group searches
* **[FIX]** Myna Administrator Running Threads: now shows threads with no URL


----------------------------------------------------------
Release Name: 1.11.0
============================
Notes: Added new Permissions manager to Myna Administrator, and enhanced Active Directory LDAP support

* **[ADD]**         Added New UI for Permissions management in Myna Adminstrator. 
* **[ADD]**         Added AuthTypes section to Permissions UI for setting up LDAP auth types, and any future connectors
* **[ADD]**         Added ability to import a group from LDAP/AD and all of it's members
* **[ADD]**         Added Authtype manager to Myna.Admin
* **[ADD]**         FlightPath: Controller.addAction() for adding controller actions at run time
* **[ADD]**         LDAP Auth Adapter: added new functions syncGroups, getGroups, searchGroups
* **[ADD]**         Myna.Ldap.lookup(dn) for retrieving attributes for a specific DN
* **[ADD]**         Successfull login with an ldap adapter now automatically all imported LDAP groups the user is a member of
* **[CHANGE]**      Added edit config to LDAP auth adapter
* **[CHANGE]**      Changed default general properties to disable strict warnings
* **[CHANGE]**      deprecated the "map" property in LDAP auth adataper configs in favor of attributeMap. Older configs will still work
* **[FIX]**         FlightPath: ModelSearchList behavior now properly creates a "list" action
* **[FIX]**         FlightPath: action parameters that match Object prototype properties are no longer filtered
* **[FIX]**         ValidationResult.addError no longer throws errors if the message contains regex symbols

----------------------------------------------------------
Release Name: 1.10.3
============================
Notes: Minor additions and bug fixes

* **[ADD]**         DataManager manager.create() and bean.setFields() now take an optional second parameter "allowMassAssignable" which will allow non-mass-assignable fields to be saved.
* **[ADD]**         LDAP Adapter: added new functions syncGroups, getGroups, searchGroups
* **[ADD]**         Myna.Ldap.lookup(dn) for retrieving attributes for a specific DN
* **[CHANGE]**      Myna.DataManager.validatorFunctions.unique and FlightPath Model.validation.validatorFunctions.unique now only apply "uniqueness checks on non-null values. Use the "required" validator to disallow null values
* **[FIX]**         Bug in TreeObject.moveNode that cused MPTT ordering errors when using "beforeNode"
* **[FIX]**         Bug in in TreeManager whern rebuildTree would not work if the root node had a left other than "1"
* **[FIX]**         DataManager bean.saveField() now properly saves fileds that are not mass assignable
* **[FIX]**         FlightPath: action parameters that match Object prototype properties are no longer filtered
* **[FIX]**         ValidationResult.addError no longer throws errors if the message contains regex symbols

----------------------------------------------------------
Release Name: 1.11
============================
Notes: Minor updates and bug fixes

* **[ADD]**         DateManager manager.create() and bean.setFields() now take an optional second parameter "allowMassAssignable" which will allow non-mass-assignable fields to be saved.
* **[ADD]**         LDAP Adapter: added new functions syncGroups, getGroups, searchGroups
* **[ADD]**         Myna.Ldap.lookup(dn) for retrieving attributes for a specific DN
* **[CHANGE]**      Myna.DataManager.validatorFunctions.unique and FlightPath Model.validation.validatorFunctions.unique now only apply "uniqueness checks on non-null values. Use the "required" validator to disallow null values
* **[FIX]**         Bug in TreeObject.moveNode that cused MPTT ordering errors when using "beforeNode"
* **[FIX]**         Bug in in TreeManager whern rebuildTree would not work if the root node had a left other than "1"
* **[FIX]**         DataManager bean.saveField() now properly saves fileds that are not mass assignable
* **[FIX]**         FlightPath: action parameters that match Object prototype properties are no longer filtered
* **[FIX]**         ValidationResult.addError no longer throws errors if the message contains regex symbols


----------------------------------------------------------
Release Name: 1.10.2
============================
Notes: 

* **[ADD]**         DataManager manager.create() and bean.setFields() now take an optional second parameter "allowMassAssignable" which will allow non-mass-assignable fields to be saved.
* **[ADD]**         LDAP Adapter: added new functions syncGroups, getGroups, searchGroups
* **[ADD]**         Myna.Ldap.lookup(dn) for retrieving attributes for a specific DN
* **[CHANGE]**      Myna.DataManager.validatorFunctions.unique and FlightPath Model.validation.validatorFunctions.unique now only apply "uniqueness checks on non-null values. Use the "required" validator to disallow null values
* **[FIX]**         Bug in TreeObject.moveNode that cused MPTT ordering errors when using "beforeNode"
* **[FIX]**         Bug in in TreeManager whern rebuildTree would not work if the root node had a left other than "1"
* **[FIX]**         DataManager bean.saveField() now properly saves fileds that are not mass assignable
* **[FIX]**         FlightPath: action parameters that match Object prototype properties are no longer filtered
* **[FIX]**         ValidationResult.addError no longer throws errors if the message contains regex symbols

----------------------------------------------------------
Release Name: 1.10.1
============================
Notes: 

* **[CHANGE]**      DS names are no longer editable. This caused confusion when setting a new name caused a duplicate data source
* **[CHANGE]**      Database errors during data source load are no longer suppressed
* **[FIX]**         Editing data sources in Myna Administrator now properly warns when there are connection errors
* **[FIX]**         Several minor syntax warnings in String, Date and DataManager
* **[FIX]**         Validations no longer error when a validator is not available

----------------------------------------------------------
Release Name: 1.10.0
============================
Notes: Bugfixes and minor features

* **[ADD]**         Added more logging feedback to startup
* **[ADD]**         Added startup delay to cronThread to prevent memory errors during startup
* **[ADD]**         Added Lifecycle functions to DataManager and OrmTemplate:
	                  * afterCreate:function (bean) {},
	                  * afterLoad:function (bean) {},
	                  * afterRemove:function (id) {}
	                  * afterSaveField:function (bean,fieldName,newValue,oldValue) {},
	                  * afterSetField:function (bean,fieldName,newValue,oldValue) {},
	                  * beforeCreate:function (data) {},
	                  * beforeLoad:function (data) {},
	                  * beforeRemove:function (id) {},
	                  * beforeSaveField:function (bean,fieldName,newValue,oldValue) {},
	                  * beforeSetField:function (bean,fieldName,newValue,oldValue) {},
* **[ADD]**         **FlightPath**: Controller.addLayout and .setLayout now support a Myna.File parameter pointing to a layout file anywhere in the filesystem
* **[ADD]**         added support for secure and httpOnly flags to $cookie.set
* **[CHANGE]**      Logging changes: force logs to either be selected logger, or standard out as fallback
* **[CHANGE]**      upgrade_tables only inspects myna_log if log_engine == "myna_log"
* **[FIX]**         **FlightPath** bug in non-db models when validating
* **[FIX]**         Bug in DataManager TreeManager.remove
* **[FIX]**         Administrator > DBManager: fixed myna code generation to refer to "db" rather than "dm"
* **[SECURITY]**    ejs and sjs files will no longer be served to the browser from flightpath static folder. This only affects applications that upgrade their flightpath folders via Add/Update Flightpath App in the Myna Administrator

----------------------------------------------------------
Release Name: 1.9.22
============================
Notes: bugfixes

* **[ADD]** Added brief documentation for DataManager lifecycle functions
* **[CHANGE]** switched download location for web upgrade to SourceForge
* **[FIX]** Administrator upgrade won't attempt to install non ".war" files
* **[FIX]** Bug in DataManager TreeManager.remove
* **[FIX]** Fixed bug in auth cookie path for FlightPath apps
* **[FIX]** *FlightPath* bug in non-db models when validating
* **[SECURITY]** ejs and sjs files will no longer be served to the browser from flightpath static folder. This only affect applications that upgrade their flightpath folders via Add/Update Flightpath App in the Myna Administrator
version number update


----------------------------------------------------------

Release Name: 1.9.21
============================
Notes: Bugfixes and minor improvements

Improvements:
--------------------
* Added basic HTML-to-text translation for "Standard Output logger"
* Added xtype debugging to admin.js HTML-to-text translation for "Standard Output logger"

Changes:
--------------------
* Logging changes: force logs to either be selected logger, or standard out as fallback
* Added more logging feedback to startup
* upgrade_tables only inspects myna_log if log_engine == "myna_log"
* removed experimental disk-script-cache. This was causing "Myna not defined" errors during startup
* added a bunch of .empty files to get GIT to store the directories

Bug Fixes:
--------------------
* fixed typo in FlightPath Model.sjs
* Administrator > DBManager: fixed myna code generation to refer to "db" rather than "dm"
* Added startup delay to cronThread to prevent memory errors during startup
* Flightpath: fixed bug in pathing for model global.sjs file


----------------------------------------------------------

Release Name: 1.9.20
============================
Notes:
Security bugfix release


Improvements
--------------

*FlightPath*
 * Added Controller.renderFile function to directly render a file to the browser, bypassing default render


Changes
--------------


Bug Fixes
--------------
* Bug in Date.add() when adding MONTHs to a date after the 28th of the month
* SECURITY: Fixed bug in FlightPath that dsiabled action filters, an therefor
  session checks

----------------------------------------------------------

Release Name: 1.9.19
============================
Notes:

This version removed the beta designation and starts a new version numbering 
scheme:

Major.Minor.Buildnum

Major version numbers will only change when significant architectural changes 
are made with little concern for backwards compatibility

Minor version numbers change with the addition of new features. No intentional 
breaks with existing functionality

Buildnum version numbers change with bug fixes and security updates


Improvements
--------------
* Upgraded Rhino to 1.7R4
* New Administrator application
* Profiler: added totals to averages display
* Profiler: added end time to summary display
* Profiler: Added experimental profile() function to attach profiling functions 
  to objects
* FlightPath: added Model path caching when not in debug mode
* FlightPath, Controller: this.model is now a lazy load property.
* FlightPath, MynaAuth behavior: rights are now cached in the session scope
* FlightPath, Direct controller: API is cached for 1 day, when not $FP.debug
* FlightPath: Controller and model paths are cached for 1 day, when not 
  $FP.debug
* FlightPath: Controller names are cached for 1 day, when not 
  $FP.debug
* FlightPath: model managers are now lazy-loading. Managers are only init'd
  if accessed
* FlightPath, application.sjs: init() clears caches when in debug mode, or 
  $application.version changes
* Added SSL support to embedded Tomcat server
* Added Permissions.getUserGroupByName
* Added String.lpad and String.rpad functions
* Added selectable logging engines to general settings.
* Added Myna.Sandbox (experimental) Java sandboxing for untrusted code
* Added Myna.Shell for interactive shell/ssh scripting
* Added optional mass assignment protection to DataManager
* Added Myna.Admin.user.getModel
* Added Myna.getGlobalScope(): a function to grab the global scope of the current 
  context
* Added scheduled task management to Myna.Admin
* Request Timeouts now call $application._onError, and close objects opened with 
  $application.addOpenObject()
* String.toHash/hashEquals now use stronger hashing algorithm: sha-256, 16 bit 
  salt, 100K iterations. String.hashEquals is backward compatible with old 
  hashes
* Changing Admin password requires either current password, or temporary auth 
  code
* Updated Myna.ThreadPool, add documentation
* Saving schedules now reloads the task grid
* $res.redirect and $res.setHeader now protect against header injection and 
  split responses 


Changes
--------------
* Removed req var dumps from Myna.formatError
* Made MynaThread.sharedScope_ a public property
* Date.formatInterval will now user singular terms for singular 
  intervals, e.g. 1 second vs 1 seconds
* removed thread limit on cron reloads
* Added New cron system. This handles large number of tasks more efficiently
* Moved Task and DataSource functions in Myna.Admin to Myna.Admin.ds and 
  Myna.Admin.task respectively
* Update FlightPath to use new Myna.Admin function names
* Changed upgrade_tables to use Myna.Admin
* Installer now removes /myna folder before upgrading to clean up old admin apps
* Myna.Query no longer caches select statements. 

Bug Fixes
--------------
* Fixed bug in central login page regarding "login_page" parameter
* Fixed bug in Permissions.UserGroup.removeRights that would cause an SQL error
* Fixed bug in Permissions.UserGroup.removeRights caused it to not exist
* added GC to health_check.sjs to prevent unnecessary restarts when garbage 
  collection is slow
* Myna.Cache now only uses a separate thread when background refreshing
* fixed bug in ObjectLib.toArray to make it IE compatible
* FlightPath.Controller: fixed docs for addFilter
* FlightPath.Controller: removed undocumented auto-creation of model key in params
* FlightPath: getModel: tables names are now converted to model names 
  when searching for a model definition
* Fixed case in header check for $server.serverUrl
* Myna.Cache: appname now properly assigned as default tag
* Myna.Cache: getByTags now works
* FlightPath, FormatPdf Behavior: Now including "$server.serverUrl+$FP.url" 
  as the base url for xmlToPdf
* Fixed setting and saving related data  in DataManager.get() and 
  save() 
* fixed bug in reload_cron when looking for deleted cron jobs
* DataManager: Fixed bug related to applying related data via 
  manager.get(data)
* DataManager: removed parent object creation/saving for belongsTo 
  associations
* $application.onError now honors canceling of default error handler
* fixed usage bug in installer  
* Myna.Admin validation tweaks
* Myna.Cache: fixed memory leak
* reverted oracle schema lookup to JDBC meta data lookup to prevent infinite recursion during query errors
* Fixed blank schema aliases in db_manager
* Fixed mis-targeted column completion dialogs in dm_manager
* Fixed calculation for weekly scheduled tasks
* fixed infinite loop for hourly tasks the day after Daylight Savings switch
* All log are now synchronous. This slows performance slightly but avoids memory 
  leaks during high logging periods  


----------------------------------------------------------
Release Name: 1.0_beta_9
============================
Notes:

bug fixes and minor enhancements

Improvements
--------------
* added Array.getUnique
* Added config.debug FlightPath option (set in application.sjs). 
* FlightPath: Behavior: MynaAuth: Now checks for server admin access
* FlightPath: $FP.getParams now logs routing failures with metadata about what 
  matched and what didn't. In debug mode, logs successful routes as well
* added cached ORM template clearing on server startup.
* added DataManager:ManagerObject::makeTree(). This will convert a normal 
  ManageObject into a TreeManagerObject
* Added Async.js to shared/js/libOO/client.sjs
* added DataSet.toMap: treats two columns as key/value tuples and returns the equivalent JS object
* added routing metadata to FlightPath. If debug is true, then this will log 
  information about every attempted route. If debug is false, this will only log 
  metadata for failed routes
* Myna.Permissions: getLogins now takes a type filter. If provided, and array of login strings is returned instead
* DataManager: added alias property to managers. This is model form of the tablename
* FlightPath: MynaAuth behavior: added anyUserList for action that just require an authenticated user
* FlightPath: MynaAuth behavior: added logging of failed authorizations when $FP.config.debug
* FlightPath: getModel: If a model is not found, all managers are now searched. 
* Array.appendUnique now takes an accessor function
* DataSet can now promote array-like objects to a DataSet
* FlightPath: added defaultDs property
* added $server.reParent (experimental)
* FlightPath: MynaAuth Behavior: added userFunction
* added toArray to ObjectLib and Object
* added remove_on_expire option to run_cron.sjs remove a task after it has expired (future use)
* added option to DataSet.toMap to map whole rows
* modified reload_cron.sjs to to clear the timer is a named task does not exist

Changes
--------------
* removed Hazelcast and dependent functions in Myna and $session
* Inflector: added "content" as an "uncountable"
* removed openid search from adduser dropdown in permissions
* LDAP auth adapter: Made searches broader, and fixed bug in search that would suppress results that did not have an email address
* DataManager: autocreation of parent bean when saving a bean with a a belongsTo association is now disabled if the relatedField is set to null
* DataManager: manager.exists() now actually tries to instantiate a manager. This allows for replacing getManager with an external manager factory, such as in FlightPath
* updated docs for Funciton.prototype.cache to warn about use in class prototypes

Bug Fixes
--------------
* FlightPath: Controller: Direct: Falls back to Object.toJson() if JSON.stringify fails
* FlightPath: $FP.getControllers now returns a raw array rather than a broken DataSet
* Myna.Admin: Datasource validation: no longer validates port if location == file
* Myna.DataManager/FlightPath.Model Automatic hasOne and hasMany associations 
  correctly map raw table name when it does not match the convention
* DataManager now uses the actual table name for hasOne and belongsTo 
  relationships
* DataManager:getLabel and genLabel now bind properly to models
* fixed bug in client-side compatibility of Validation.toCode()
* bug fixes for DataManager:TreeNodeObject: moveNode
* Bug fixes for FlightPath::Controller:getElement
* modified permissions/auth.sjs to honor a passed loginPage
* Cosmetic changes to adduser dropdown in permissions
* DataManager: Fixed bug where same named tables in different datasources could overwrite each other in the class cache
* DataManager: Fixed bug where "" was not considered null in the primarykey field
* DataManager: fixed default column names for associations
* DataManager: added better error handing for relatedBean dereferencing errors
* fixed bug in Database.getTable() that was causing problems with same named tables in different datasources
* FlightPath: Models: fixed bug related to converting plural model names to singular
* changes to centralized login to better handle proxied sites
* added required properties checking to DataManager association definitions
* DataManger: Added sanity checks for associatations
* Validation: made more browser-side friendly
* Fixed subtle bug in $req.type that caused it to report the wrong HTTP method
* DataManager: TreeManager: create() no longer sets tree related columns when 
	the bean exists. Should use TreeNodeObject.moveNode to manipulate tree columns




--------------------------------------------------------------------------------

Release Name: 1.0_beta_8
============================
Notes:

This release contains a major change to $application, introduces 
application import/export, enhanced cluster support, performance 
enhancements, minor bug fixes and documentation updates


Introducing Myna FlightPath
---------------------------

  Myna FlightPath is a Model-View-Controller(MVC) web application framework 
  inspired by CakePHP, CFWheels and Ruby On Rails. This allows you to write your
  business logic as plain JavaScript functions, your displays as EJS templates, 
  and have your data objects automatically generated from the database, nearly 
  eliminating the need to write SQL.     

MynaServer
-----------

  Myna now has an embedded Tomcat server that can be used instead of deploying 
  Myna inside an existing application server. Executing "java -jar myna-<version>.war" 
  will now offer options for ugrading anexising Myna folder or installing Myna, 
  including startup files for the embedded Tomcat server. On Linux system, the 
  installer will create your init scripts for you and install them to 
  /etc/init.d. When Myna is run this way, a watchdog process is spawned that 
  periodically checks on the Mynaserver to make sure that it is running and 
  performing well, and will restart it if it is failing.  
  
     
DataManager Improvements:
---------------
* DataManager: added manager.query
* DataManager: added manager.createdCol
* DataManager: added manager.modifiedCol
* DataManager: added manager.addValidator
* DataManager: added manager.genLabel
* DataManager: added manager.setLabel
* DataManager: added manager.setLabels
* DataManager: added manager.getDefault
* DataManager: added manager.setDefault
* DataManager: added manager.setDefaults
* DataManager: added manager.belongsTo
* DataManager: added manager.hasOne
* DataManager: added manager.hasMany
* DataManager: added manager.validatorFunctions
* DataManager: added manager.validatorFunctions.length
* DataManager: added manager.validatorFunctions.list
* DataManager: added manager.validatorFunctions.regex
* DataManager: added manager.validatorFunctions.type
* DataManager: added manager.validatorFunctions.unique
* DataManager: added manager.get()
* DataManager: added manager.getNew()
* DataManager: added manager.save()
* DataManager:	added managerExists()
* DataManager: added bean.deferred
* DataManager: added bean.forceDelete
* DataManager: added bean.getLabel
* DataManager: added bean.remove
* DataManager: added bean.validate
* DataManager: added bean.isDirty
* added where clause support to Manger.find/findBeans
* DataManager: added logging of validation errors
* DataManager: added explicit BLOB/CLOB detection in length validation
* DataManager: lazy load related models
* DataManager: added toJSON function that returns getData(). This means that 
  someBean.toJson() will get data fro related records also
* Added native pagination for PostgreSql, MySql, and Oracle
* DataManager: findBeans() now natively calls query, instead of running a
  separate query for each bean
* added DataManager class generation and caching. This can have a significant 
  speed increase for optimization levels > -1
* added getField, getFields and getType to DataManager
* changed DataManager to use Myna.Validation for validation 

Other new features:
----------------------
* Added NoCase versions of String.compareNatural and String.compareAlpha
* Myna.File: Added "maxFiles" param to listFiles
* Myna.File: Optimized listFiles to directly apply filter, and allow for 
  exceptions to halt directory recursion
* Myna.File: Added readLine(pos) function 
* Myna.File: modified readLines() to readLines(start,end) to allow efficient 
  windowing
* added Myna.Admin
* Added Validation.js, generic validation object that returns a ValidationResult
* Array: added appendUnique
* String: added getField, getFields and getType to DataManager
* Database: cache table instances
* Added function Object/ObjectLb.setByPath
* added Object.toStruct() and ObjectLib.toStruct()
* added $O wrapper to ObjectLib. 
* added soft delete support to Myna.DataManager
* Made DataSet browser compatible
* Added DataSet.toStruct
* Added DataSet.pivot
* Added Date.parseInterval
* $req.data params with dots("SomeVar.name=bob") will be turned into objects(SomeVar={name:"bob"}) via Object.setByPath
* added Inflector class
* String.after now accepts strings and RegExp objects
* String.before now accepts strings and RegExp objects
* Added String.startsWith
* Added String.endsWith
* Added String.escapeJs
* Myna.File() now accepts multiple path parts as arguments. These will be joined 
  to together inserting and removing "/"s as necessary
* added request url to timeout error logs
* added a file filter to File.copyTo
* Upgrade postgresql driver to 9.0-801
* Added Function.cache() for making run-once-and-cache functions
* Objet/ObjectLib.toJson() now honors toJSON functions on objects in a manner 
  compatible with JSON.stringify()
* Added commons-cli.jar
* Added MynaServer class
* added $server.mynaCmd
* added $req.data.argArray for raw commandline arguments
* added raw inputStream, errorInputStream and process instance to executeShell result
* added watchdog features to MynaServer via general.properties
* added bootstrap.MynaServer as the main class for the war file
* better info on the running requests screen
* added Object.map() and filter()
* added String.format()

Bug Fixes:
-----------
* updated H2 drop constraint SQL
* restored currentDir functionality to Myna.include
* $cookie.get() is now case insensitive
* $cookie.set() now returns the value set
* fixed spelling error in content type for printBinary
* Removed interval requirement for saving cron jobs in Administrator
* Now ignoring errors generated by $res.flush()
* Removed lock from cron runs
* Bug fix for Myna.dump() to properly display contents of queries
* ObjectLib::before()/after(), expandos on the function object are now preserved 
  when converting to a chain function
* added 2 minute delay after server startup for running cron tasks
* fixed bugs in toFixedWidth
* $cookie: auth cookies now set on the application url path, instead of the current subpath
* $res.serveFile now fires $application.onError404 instead of throwing an error
* JSServlet: normalized getOutputStream/getWriter usage
* JSServlet: set initial contentType to text/html
* CronThread: now finds webroot relative to general.properties instead of "."
* removed "openid" provider type
* Fixed bug in directory listings. Now properly honors Admin setting.
* Modified Myna.log() to directly insert instead of using the DataManager
* moved db properties into Myna.Database
* added dsValidation property to Myna.Admin
* Fixed bug in Myna.Thread that caused jetty/tomcat to lose request parameters
* Created bootstrap.MynaInstaller for install/upgrade form war file
* Created info.emptybrain.myna.MynaServer for running Myna from an installation directory
* added individual cron reload
* modified ldap adapter to properly check for filter property in config
* increased default watchdog delay to 180 seconds to allow Tomcat to generate 
  session key on first startup
* added -l to unix init_script to prevent "access denied" error when running 
  from cron 
* DataSet.sortByCol now returns a reference to "this" for chaining


     
--------------------------------------------------------------------------------
Release Name: 1.0_beta_7
============================
Notes:

Includes bug fixes and the experimental commandline feature

New Features: 
--------------------------------
* PDF Creation	 Myna can now generate PDF's from XML or XHTML content.  See Myna.xmlToPdf
* Myna.Swing	 Intended to be used with Command Line Mode, this allows scripting of the Java Swing GUI library for creating dialogs.  See Myna.Swing
* Tree Organized Tables	 The new DataManager function getTreeManager() allows for the manipulation of Modified Pre-order Tree Traversaal (MPTT) organized tables. This method allows for storage of hierarchical information in table in an efficient manner. See http://blogs.sitepoint.com/hierarchical-data-database-2/ for an overview of MPTT
* Other Changes:

Other Changes:
* Added Myna.Table.getSqlColumnName()
* Added $application.clear()
* Added $application.reload()
* Added Added beanClass property to DataManager manger objects
* Added manager caching to DataManager
* Optimized bean.setFields to issue a single update statement
* Now loading Hazelcast in background Thread
* Added Myna.Swing Library
* Added $res.setExitCode for setting exit code from commandLine. Special exit
  code of -1 will cause Myna to run in background for GUI apps
* Modified MynaThread to not cache shared scope when in -1 optimization level
* Added bespin editor to db_manager
* Added maxRows and offsetRows templates to db properties files
* Added Object.prototype.createProxy()
* Object/ObjectLib.hideProperty now using ES5 syntax
* Added improved logging for authentication failures
* Added improved logging for ldap authentication failures
* Fixed authentication bug that caused JSON symbols in request parameters to
  terminate argument processing
* fixed bug causing 404's to not actually return a 404 error code
* removed REST param processing for threads
* Directory listings are now only shown if the application does not handle the
  request
* Several improvements to Myna.profiler: getAveragesArray(), getAveragesHtml(),
  getAveragesText()
* Completed improved scheduling
* HttpConnection now allows circular redirects
* Added Date.monthsBetween()
* Changes/fixes to scheduling
* Added Myna.threadSafeSet()
* Removed console.debug from Administrator
* Added Table.hasIndex
* Added Array.contains()
* Added $res.setExitCode for setting exit code from commandLine. Special exit
  code of -1 will cause Myna to run in background for GUI apps
* Cron bugfixes
* Doc updates
* Added Date.diff
* Added Myna.executeWinBatch
* Added Array.first() and Array.last()
* Removed background memory management form Myna.Cache to improve performance
* HttpConnection.connect() now returns a reference to itself, to allow chaining
* Added commons.net and jsch libraries
* Added Myna.xmlToPdf function via Flying Saucer
* Added Myna.htmlToXhtml to clean up bad HTML
* Added ext 3.3.1 to /myna/, updated Myna apps to match
* Added String.toXmlDoc() for creating an org.w3c.dom.Document from an XML string
* Removed abort error message from permission redirects
* added slate theme for admin apps
* added icons to permissions
* added TreeManagerObject to DataManager for manipulating mptt tables
* updated E4X docs on looping
* added XML detection to Array.parse
* Myna.Query: removed generated key detection since it caused intermittent
  insert/update failure in Oracle
* Administrator, Scheduled Tasks: Fixed bug in weekday display
* Added custom SocketFactory so that LDAP and HTTPS connections can be made to
  servers with untrusted (self-signed) SSL certificates
* added better loggging for authentication failures
* changed auth adapter caching to $req scope
* fixed bug in chainFunction that caused recursive calls in to the chain to
  poison the chain stack
* Updated Ext.Direct tree example to use DataManager.getTreeManager to demo
  mptt-organized tables
* Myna.WebService: Service function are now mapped directly on the service
  object, where there is not a name conflict
* Myna.JavaUtils.beanToObject now handles get_ and set_ functions
* H2 datasources now use AUTO_SERVER=TRUE for lock management
* Many updates to TreeManager behavior in DataManager
* Examples are now enabled via application.sjs rather than forcing a login
* Modified JSServlet to return a binary stream.
* Modified db_manager to return JSON as application/json
* Added native JSON parsing to db_manager
* Fixed pager toolbar updates in the administrator
* Added native JSON parsing to String.parseJson(), when available
* Added better searching to myna auth adapter
* WebService: added "action" param to Ext.Direct API
* DataManager: fixed case sensitivity bug in find()
* DataManager: fixed TreeManager bugs
* DataManager: default genKey function now uses UUIDs for text primary keys
* $cookie: clear() now now has a deleteParentPaths param
* $application: fixed bug in rights import
* Myna.Query: now using column labels instead of column names in results to
  properly detect column aliases
* Fixed bug in db_manager foreign key detection
* Modified URL processing to allow application.sjs to override urls that end in /
* DataManager: added logQueries property
* DataManager: fixed bg in find() case sensitivity
* Added DataSet.js, a client-side compatible version of DataSet
* Added Query.log property

---------------------------------------------------------------------------------

Release Name: 1.0_beta_6-1
============================
Notes:

Includes bug fixes and the experimental commandline feature

New Feature: Commandline Mode
--------------------------------

The Myna commandline invoker consists of an executable BASH script file for UNIX 
("myna") or a command file for Windows ("myna.cmd"). This file is (re)created in
MynaPath /WEB-INF/myna/commandline every time the Myna server is launched. If  
the Myna installation is later moved, it will need to be launched at least once 
to re-create the invoker file. 

See the [docs][commandline-docs] for more info.

Other Changes:

* Updated h2 DB engine to 1.2.142
* Added Myna.dumpText to create an ASCII tree instead of HTML
* Fixed formating bug in EJS eval blocks
* fixed infinite loop bug when listing the webroot
* "_index" as the last item in a URL will causes a file listing to be displayed even if there is a valid index file. 
* added "null" date of 01/01/1900 as lastMofidied for files that do not have a lastModified time


[commandline-docs]:http://www.mynajs.org/shared/docs/js/libOO/files/install-txt.html
--------------------------------------------------------------------------------

Release Name: 1.0_beta_6
============================
Notes:

This release contains a major change to $application, introduces 
application import/export, enhanced cluster support, performance 
enhancements, minor bug fixes and documentation updates

Highlights
------------
* **Reworked application definitions**

  To support exporting and importing Myna applications, several 
  changes were made to $application to include application metadata 
  and to improve workflow. Specifically:

  * *Format*

     Instead of raw JavaScript code, application.sjs files should now 
     be an anonymous application config object. The properties of this 
     object will be copied to $application. A template for this object 
     with comments is available in the API docs under "Application 
     Template"

  * *init() function*
     
     This new application config property defines a function that is 
     executed after applying the config to $application, but before 
     nested configs are applied. This is analogous to the way classic 
     application.sjs files worked.

  * *Application  Request Workflow*

     Setting workflow functions on the application config object 
     (onRequestStart,onError,etc) will now create a function chain 
     with any previously defined application configs automatically. 
     See $application in the API docs for more detail on the order 
     of nested application workflow function execution.

  * *Application  Metadata*

     The application config now includes metadata such as displayName, 
     author, minMynaVersion, etc. All app properties can be accessed 
     via Myna.loadAppProperties(path) and are used by Myna's new 
     import/export feature

  * *Backwards compatibility*

     Although the old style of application.sjs files is now 
     deprecated, Myna will automatically detect this style of config 
     an processes it in the old manner. This means that this change 
     should have no effect on current applications.

* **Application import/export/install**

    A new section has been added to the Myna Administrator: "Manage 
    Applications". This section provides the following app related 
    functions:

     * *Import*

       Importing an application makes the Myna Administrator aware 
       that a particular directory represents an application. All 
       application properties are set in that directory's 
       application.sjs file

     * *Export* 

       Exporting an application creates a Myna Egg from the 
       application definition. Myna Eggs are ZIP archives of an 
       application directory. After exporting the .egg file, a 
       checksum is created that can be used to verify that the Egg has 
       not been modified. Ideally the checksum would be obtained from 
       a known reliable source, such as the app author's website, and 
       then the Egg could be mirrored anywhere. Eventually I would 
       like to provide an app registry on mynajs.org for listing 
       applications and checksums.

     * *Install Egg* 

        Installing an Egg involves unpacking the Egg file and 
        registering the application with Myna. You can optionally 
        verify the Egg with a checksum

* **Improved CommonJS support**

   Using Rhino's native "require" support and the Narwhal CommonJS 
   library, Myna now has native support for CommonJS. This means that 
   you can place CommonJS libraries in any of the locations defined in 
   Myna's General Settings and include them via require(). This also 
   provides a mechanism for loading libraries distributed in other 
   applications, like so:

        var lib=require("path/to/app/libname")



* **Improved REST support**

   Myna now handles all requests, not just .ejs.sjs and .ws files. 
   Myna now also automatically loads an index.ejs or index.sjs if 
   available, or displays a directory listing (turn this off in 
   General Settings). Where REST applies is that you can now processes 
   arbitrary URL's that do not have to match the actual filesystem 
   without using URL-MAP. Simply process the $server.requestDir and 
   $server.requestScriptName in your application's onRequestStart 
   function. This is also useful for creating dynamic objects that 
   look to the browser like static objects. For example 
   /myapp/charts/1123445.png could be processed like so:

        //in myapp/application.sjs
        {
           onRequestStart:function(){
              if ($server.requestDir.listLast("/") == "charts"){
                 var chart_id = 
                    $server.requestScriptName.listFirst(".");
                 // Generate chart from database with something 
                 // like JCharts. 
                 $res.serveFile("/tmp/uniquename.png")
                 // Let Myna know that this request has been handled
                 // so a 404 error is not triggered
                 $req.handled=true;
              }
           }
        }
        

* **New Cluster features: Map and Queue**

   * *Myna.Cluster.Map*

     A cluster-wide Java Map object that can be narrowed by instance 
     or purpose. This allows multiple myna instances to have a shared, 
     thread-safe key-value store. 

   * *Myna.Cluster.Queue*

     Provides a way to create cluster-wide work queue where no item 
     can be handled twice. This is useful for distributing tasks 
     across all machines in the cluster. Future enhancements may 
     include a ClusterThread class, similar to Myna.Thread that is 
     automatically distributed across the Myna cluster


* **New start page and document home**
   This version includes a new start page that points to a new 
   document home. This page contains links to the administrator and 
   and API docs, and includes a "Getting Started" tutorial for 
   working with Myna
Other Features
---------------
* Added Function.prototype.bind
* Added ID property to fired Events
* Added String.before and String.after functions
* updated to Rhino 1.7R3pre from CVS
* updated narwhal
* Added json-sans-eval (json-minified.js) to /shared/js.
* Added functions byteArrayToBase64 and base64ToByteArray functions to 
JavaUtils
* Added functions byteArrayToHex and HexToByteArray functions to 
JavaUtils
* Added functions getChecksum and isValidChecksum to Myna.File
* Added function Myna.loadAppProperties() to get application 
properties by path
* Added Myna.printConsole() function
* Added function toJava to String
* Added "urlSafe" parameter to JavaUtils.byteArrayToBase64
* Added "urlSafe" parameter to String.toHash
* Added Function.createChainFunction()
* Added Function.before()
* Added Function.after()
* Added String.prototype.getLineIterator();
* Modified Myna.Thread to add deleteOnJoin property
* Added BalusC's FileServlet
* Added MynaThread.requestHandled property. This is similar to 
$req.threadHandled, but it disables post-processing by JSServlet. This 
is set automatically by $res.serveFile
* Added $res.serveFile  
* Added default hazelcast.xml file
* Added automatic unicast configuration for hazelcast
* Made Event function thread-safe
* Added Event.getListeners and Event.removeListeners
* Added $server.ipAddresses property
* Added "cluster_members" table to upgrade_tables.sjs
* Added Myna.sync as a convenience function for 
Myna.JavaUtils.createSyncFunction  
* Added Myna.Cluster
* Modified cluster startup to skip first stage
* Added String.trimIndent()
* Updated MynaEjsParser to call trimIndent().trim() on EJS blocks
* Added $server.properties: a shortcut to Myna.getGeneralProperties()
* Added Array.prototype.compact() - removes "undefined" elements
* Modified $req.getHeaders() to parse headers as dates, if possible, 
and to accept lowercase key names
* Modified Myna.Query to immediately close the resultset after 
handling all rows
* Myna.Thread: now waiting for thread to exit on joins instead of when 
the script finishes
* Myna.Thread: now compacting the thread arrays after deletes to save 
a bit of memory and make them easier to work with
* Modified EJSParser to use a string array buffer for generated 
content instead of the thread buffer. This provides better thread 
safety
* Cosmetic changes to Myna Admin
* Added String.toFixedWidth
* Added Profiler.getSummaryText
* Added profiling to DataManager in getById and Find
* Added more profiling for queries

Bug fixes
----------------
* Modified DataManager.find/findBeans to better handle non-string 
criteria
* Modified Object(lib).before/after to be consistent with 
Function.before/after
* Modified Myna.ThreadGroup to have join() only join the the threads 
in the group instead of all threads
* Bug: added range checks for String.before and String.after
* WebService: Not defining any functions no longer causes an error


--------------------------------------------------------------------------------

Release Name: 1.0_beta_5
============================
Notes:

This release contains some new features, performance
enhancements, minor bug fixes and documentation updates


New Features
------------

* Added symlink support. Now myna pages inside symlinked sub directories will 
  appear to be in the myna directory instead of the actual directory where the 
  file resides. This should allow application.sjs nesting to work properly 
* Added extra parameters to Myna.Thread.joinAll(): timeout, throwOnTimeout, and
  killOnTimeout
* Added Myna.ThreadGroup: a class for grouping multiple threads together with
  the same options
* $cookie.getAuthUserId() will now return the same value in a subThread as in
  the parent thread
* Cookies and request data in subThreads now match the parentThread
* Added property to WEB-INF/general.properties: webroot. When this 
  property is set to an absolute MynaPath, then this directory will be 
  used instead of attempting to calculate the root directory
* Modified several file tests to interpret security exceptions as 
  "not exists". This makes Myna more friendly to security managers
* Updated H2 jar (1.2.131)
* Added "json-sans-eval" by Mike Samuel as the default JSON parser. This parser
  offers a speed increase and the ability to parse dates. This parser also does 
  not use eval() so it is impossible to execute JS code in JSON 
* Added Hazelcast distributed messaging system. Currently cluster membership is 
  based on the myna_permissions connection details. Only instances with the same 
  url and password for myna_permissions will cluster   
* Added new property $server.dataSources which is a JS structure of DataSource 
  details
* Made some cosmetic changes to the Myna Administrator to make it more clear 
  which server you are looking at when you have multiple servers
* Added event system to Myna via Myna.Event. This allows distributed events 
  across the Myna cluster
  
Bug Fixes
----------
* fixed bug where Database.isCaseSensitive was blowing up for in-memory
  databases
* fixed bug in case-sensitive db code that caused all datasources to be
  sensitive
  by default
* Fixed bug with webroot property that could cause errors accessing files
* Fixed bug in $cookie.getAuthUserID that could cause timeouts on every page
* Modified new password dialog to use a Myna include instead of includeTemplate
* Fixed bug in Table.modifyColumn related to isCaseSensitive. This was causing 
  the "black page" problem in beta4
* Added fix for bug that caused logins to fail when the token contains
  url encoded characters
* Modified DataManager.manager.find to detect numeric search criteria
* Various Myna.Thread tweaks
* Fixes for PostgreSQL schema support 
* Changed default lock type to "SERIALIZED"


------------------------------------------------------------------------

Release Name: 1.0_beta_4
============================
Notes:

This release contains some new features, performance
enhancements, minor bug fixes and documentation updates


New Features
------------
* **Added a sub-template pre-processor to XTemplate.**

  entering a path inside hard brackets "[]" in an extemplate will internally 
  call Myna.includeTemplate() with that path and the currently scoped values.
  The text generated from the template will be inserted at that location. This
  makes it possible to include Templates from inside other Templates.

* **Added new data source property: "Use case-sensitive names?"**

  This is "false" by default. Setting this to true will cause all references to
  database table names and columns to match exactly how the entity is 
  defined in the database instead of being forced to lowercase. 

* **Added "mynaThread" property to Myna.Thread**

  This property references the subThread's MynaThread instance. Setting this to
  null will prevent access to the subThread but will also allow the subThread's
  memory to be released when the thread finishes
  * **added Myna.Thread.releaseOnJoin property**

     Default "false". When set to "true" all subThread's are released after a
     call to join()

  * **Added Myna.Thread.captureOutput property**
     Default "true". When set to false, no output will be captured from 
     subThreads. Combining this with _Myna.Thread.releaseOnJoin_ results in
     maximum memory efficiency for "fire and forget" subThreads


Other Changes
-------------

* modified Myna.Permissions.User.qryRights() to provide more useful columns
* Fixed bug in permissions application regarding user group rights
* Fixed but in WebService constructor when passing a file path
* Fixed bug in Myna.Permissions.UserGroup.addRights regarding key generation
* moved ext from the /shared/js/ext_latest folder to /myna/ext. It is 
  recommended that users install their own copy of Ext and not refer to the 
  version distributed with Myna
* Modified Myna.includeTemplate to use an XTemplate internally and 
  fixed the documentation
* Modified global Java error handler to print stack traces as usual 
  when instance purpose is "DEV". Any other instance purpose will 
  generate "An error has occurred. See administrator log for details." 
* Modified File.listFiles to now return directories as well as files.
* Modified File.listFiles to accept either filter definition or the 
  string extension list as the first parameter
* updated docs to include examples for File.listFiles
* added db_property "columnQuoteChar" which is the backtick for MySQL
  and the double quote for the others. This can be used anytime you 
  need to escape and column or table name 	
* Fixed bug in Date.formatInterval where milliseconds were not being rounded to
  a whole number
* Fixed bug in DataManager.manager.findBeans that caused an error for
  numeric keys
* Fixed several DB bugs related to the new columnQuoteChar property
* Added per request DB metadata caching. This should speed up DataManager
  operations
* Added newline (\n) to Myna.println to make the source more readable.
* Converted all references to HashTable in MynaThread to 
  ConcurrentHashMap. This should allow better performance under heavy 
	load
* Converted all concurrency classes in MynaThread to Java 5 classes. 
  This should provide slightly better performance and better 
	reliability since the oswego.edu classes are now deprecated
* The $server.currentDir property is now set correctly inside of 
  application.sjs files. Previously any Myna.File operations in these 
  files where executed against the /shared/js/libOO directory. These 
  are now executed against the directory in which the application.sjs 
  file resides. Also note that $application.on<event> functions will
  execute against $application.directory, which may not be the same
  directory in which the function was defined, if the event function 
  has been chained via Object.after()
	


------------------------------------------

Release Name: 1.0_beta_3
============================
Notes:
This release contains a major security fix, minor feature 
enhancements, minor bug fixes and documentation updates

Security Fix
------------
* Fixed authorization error in db_manager that allowed un-privileged
  access

New Features
------------
* Added Myna.Permissions.User.hasAnyRight: This tests if the user has 
  any in a list of rights. Good for deciding whether to allow a user 
  to log in  
* Added String.listQualify: adds a symbol to the beginning and end of 
  each list item. Good for escaping text lists for use in SQL
* Added $res.redirectWithToken: redirects user to a URL, including an
  auth_token of the current user. Used to enable auto-login to other 
  Myna applications 
* Added Object.copy: shallow and deep object copying
* Added Permissions.getAppValues: returns display name and description
  for an  app, or null if app does not exist
* Added support for Google's openid ns.ax properties. Google only
  supplies email and language currently, but Myna asks for all the reg
  properties in case they change their mind.


Other changes in this release
-----------------------
* Fixed several bugs with Permissions.addApp
* Removed some stack traces from printing to prevent information leaks.
	stack traces still available in logs
* Updated $server.resolveUrl to handle absolute URL's intelligently 
* Fixed delimiter bug in listMakeUniqueNoCase
* Added deferExec bug fixes 
* Sync error logging for WebServices
* Added error logging for printExtApi(ext-api)
* Fixed bug in ext api for functions with no parameters
* Fixed bug in ext api documentation for AJAX callbacks
* Better error handling for web service objects



------------------------------------------

Release Name: 1.0_beta_2
============================
Notes:
This release contains bug fixes and minor enhancments

Changes in his release
---------------------

* Added function Myna.Permissions.getRightByName
* Modified Myna.Permissions.addRight to modify an existing right if found rather 
  than create duplicate right
* Modified Myna.Permissions.addUserGroup to modify an existing group if found 
  rather than create duplicate group
* added  function Myna.Permissions.addApp
* added function WebService.getAuthUser
* allowed any user with "`myna_admin/full_admin_access`" right to have full access 
  to the permissions application
* Added the ability to add users through adapter searches to the permissions 
  application 
* added index for `event_ts` to `myna_log_general` table
* made "today" the default criteria for "start date" when viewing the general log
* modified the "after log id" search to use the timestamp rather than 
  lexicographical comparison of the log_id because UUID's have no guaranteed order
* fixed bug in login page that cause the page to fail under tomcat  

---------------------------------------

Release Name: 1.0_beta_1
============================
Notes:

This marks the first release of the 1.0 beta cycle. This should be the last 
release to make changes to Myna's API's that could result in existing code 
breaking. Future releases in the Beta cycle will focus on bug fixes, performance
improvements, documentation and optional features.


Changes in this release:
------------------------

* **DataManager:** This is a re-write of the DataManager extension system to 
  address a design flaw that resulted in extensions altering the behavior of the 
  global DataManager object. **Any code that used the "subClasses", 
  "ManagerBase" or "BeanBase" objects will need to be re-factored to work with 
  this release.** The most likely consequence is in the genKey function used to 
  generate unique primary key values. Here is an example of the old way and the 
  new way:

        var dm = new Datamanager(ds);
        //Old way
        dm.ManagerBase.prototype.genKey=function(){
            return new Myna.Query({
                ds:this.ds,
                sql:"select main_sequence.nextval from dual"
            }).data[0].nextval
        }
        //New way
        dm.managerTemplate.genKey=function(){
            return new Myna.Query({
                ds:this.ds,
                sql:"select main_sequence.nextval from dual"
            }).data[0].nextval
        }
        
 Essentially, prototype inheritance has been replaced with 
 DataManager.managerTemplate and DataManager.beanTemplate. The "subClasses" 
 structure has been dropped altogether. 

 **Other DataManager Changes:**

 - ManagerObject.create() will now check for an existing row if the primary key 
   is provided and perform an update instead of an insert if the row already 
	exists. This means that code that depends on a key violation to prevent 
	duplications or overwrites needs to be re-factored to explicitly check for 
	existence via ManagerObject.find()

 - Improved documentation. The API documentation has been updated to reflect 
   these changes, and more detail is provided on how to take adavantage of 
   DataManager's extension system.


* **Added Myna.KeyStore.** This is a front-end to Google KeyCzar project and 
  provides a rotatating keyset for encrypting/decrypting or signing/verifying 
  string or binary data using either symmetric or asymmetric (public and 
  private) keys. It is possible to export/import public keys so that two or more 
  Myna servers can securely communicate.
	


----------------------------------------------------------

Release Name: 1.0_alpha_17-3
============================
Notes:

Bug-fix release

changes:
--------------------

* fixed bugs in DataSet and File.listFiles
* fixed bug that prevented parsing of multipart/form-data requests
* performance enhancement to String.toXml()
* added Myna.xmlToObject() and Myna.dump() support for XML objects
* Fixed defect 1 http://code.google.com/p/myna/issues/detail?id=1
* fixed bug with "decimal digits" in Table.create()
* modified Table to allow deferred database updates
* Changed how Table.modifyColumn works
* fixed bug in permissions app that prevented login

----------------------------------------------------------

Release Name: 1.0_alpha_17
============================
Notes:

New features include OpenID Login support and a centralized login page

New in this release:
--------------------

* **Centralized Login page with OpenID support**
  
   Applications can redirect a user to the central login application 
	 at /myna/auth/auth.sjs?fuseaction=login by calling 
	 $res.redirectLogin(). Here is an example from the applciation.sjs 
	 file in /examples:

        $application.after("onRequestStart",function(){
          if (!$cookie.getAuthUserId() || 
            !$cookie.getAuthUser().hasRight("myna_admin","full_admin_access") 
          ){
            $res.redirectLogin({
              callbackUrl:$server.requestScriptName,
              title:"Myna Administrator Login",
              message:"You must Myna Administrator access to view examples."
            })
          }
        }) 

   This code checks on every request for a valid authentication cookie 
	 and if available, the current user's access to the Myna 
	 Administrator. If either test fails then the user is redirected to 
	 the centralized authentication application. After authentication 
	 the user is sent back to the page they were originally requesting.
	 If the auth tests pass this time, the request is processed as 
	 normal. By default, the login page authenticates via "openid" + 	 
	 Myna.Permissions.getAuthTypes(). If you are not familiar with 
	 [OpenID][1], it is an open standard for allowing a web applications
	 to authenticate users against third-party providers. All a user needs
	 is their OpenID URL. Myna makes this even easier by generating OpenID
	 URLs for popular providers such as Google, Yahoo, and AOL. Once a 
	 user authenticates with their provider,  Myna automatically creates a 
	 local user with the supplied OpenID URL as one of the logins. If the 
	 user's OpenID provider supports registration, then information about 
	 the user such as name, nickname, date of birth, etc is 
	 stored as well and is available in the user object.     
	 
	 The centralized authentication can easily be customized to show only 
	 certain auth_types, or to use your own login page. 
	 
	 The username/password auth types implement a progressive timeout. 
	 Each failed attempt incurs an extra 5 seconds of sleep time, e.g. 
	 first failure=5 seconds, second failure=10 seconds, etc. This makes 
	 brute-force password attacks impractical. Furthermore, authentication 
	 is  forced single-threaded via an exclusive memory lock so that this 
	 timeout can not be bypassed by executing many concurrent requests. 
	 
[1]:http://openid.net/


* **Fixed orphaned libraries**

   Created 'version_list.properties in WEB-INF/classes to store the list 
	 of jars provided with Myna and their versions. Also renamed all 
	 existing jars to their generic names, not including version 
	 information. This will prevent old version of jars from lingering 
	 after upgrades. **Myna 1.0 Alpha17 should be installed fresh** to 
	 remove old libraries. Future versions should not have the orphaned 
	 library problem.
	
*  **Myna datasources are now also Java DataSource objects**

   Internally, Myna now stores datasources as Java DataSource objects. 
	 Myna.Query, Myna.DataManager, and Myna.Database can now accept a Java 
	 DataSource instance as well as a Myna datasource name. this means 
	 that you can use these utilities with Java datasources accessed 
	 through JNDI or even DS's created at runtime. This functionality is 
	 used in Myna.DataSet to allow DataSets to be queried as if they were 
	 a database with a table called "data"
	 
* **Myna.Thread Changes**

  Another major update to thread handling. There has been a problem with 
  sub-threads randomly linking to the parent thread and then writing to 
	the wrong thread buffer and/or losing global objects. Myna.Thread now 
	calls toSource() on the supplied function and only transmits the 
	source code to the subthread. 
  
	The "thread cannot call itself" restriction has been removed, but the 
	maximum thread chain depth is still 5 levels to prevent infinite 
	thread recursion  

  Also added Myna.Thread.getThreadArray(), a static function that 
	returns an array of the threads spawned in this thread.
	
	
Other changes:
--------------------
* String.listContains and listContainsNoCase now accept a list as an 
  argument. If provided, every element in the search list must be in 
	this list.  
* Updated the Administrator, Permissions, and DB manager apps to use 
  centralized login
* Added `/shared/reset_default.css`. This file allows arbitrary elements 
  to have "normal" styles if they have a class of "reset_default". This 
	is useful if the default styles have been removed by Ext or similar 
	frameworks
* Added openid-selector for selecting OpenID's
* Added timeout option for HttpConnection. If the connection fails to 
  connect or receive data for timeout milliseconds, an exception is 
	thrown
* DataManager bugfixes
* deprecated $server.requestServerUrl in favor of serverUrl
* added $res.redirect(url). This is a classic server-side 302 redirect
* $cookie now keeps track of pending cookies not yet sent to the 
  browser. This means a call to get() immediately after a call to set() 
	will now return the new value.
* Automatic `auth_token` processing: If a `auth_token` parameter is 
  passed in a request, Myna will now automatically consume the token, 
	set $cookie.setAuthUserId() and redirect the request to the original 
	page minus the auth_token parameter. This simplifies inter-application 
	authentication
* added new properties to users to match OpenID's simple registration: 
  country, dob, email, gender, language, `last_name`, `middle_name`, 
	nickname, postcode, timezone
* Added "prettyName" and "desc" properties to auth_types. These are 
  utilized by the centralized authenticator
* Added global 404 handling. This is for both Myna and non-myna missing 
  pages. Handling is set via $application.onError404().
* Added $server.remoteAddr property
* All class properties hidden for Array and Myna.DataSet
* All class properties hidden for DataManager beans
* URL and FORM parameters are now case sensitive   
* fixed bug in regexEscape    
* ldap auth adapter now creates a new connection for each operation
* Myna.Ldap now closes opened connections after every request
* Added $application.url property. This is the URL path to the closest 
  application.sjs file
* added javaDataSources property to MynaThread. This is contains java 
  DataSources by ds name
* added enhanced stack traces and some $server details to 
  Myna.formatError
* fixed ClassCast exception when throwing string errors
* Fixed bugs in getThreadValue and getContent so that they actually work
* modified Myna.log to run in a very low priority thread (-90%)
* added "openid" as a login type to the permissions application
* removed several leaked global variables from request_handler.sjs and 
  from the property hiding routines in Array, Object and DataSet
* Myna.include and includeOnce now return the supplied scope after 
  execution    
* Myna.WebService can be called with an Myna.File or a MynaPath to a 
  spec file instead of a spec object
* Myna.WebService functions can be called directly by calling 
  <ws instance>.functions.<function name>(params). This will also 
	execute authFunction, beforeHandle and afterHandler, so be sure to 
	call <ws instance>.setAuthUserId() before directly calling functions
* Myna.WebService now uses the web service instance instead of the spec 
  object as the "this" scope for functions. The spec can still be 
	accessed via "this.spec"  	
* the permissions application has been converted to use the new .ws 
	extension
* Modifed Rhino context settings to automatically convert Java native 
	types returned from Java functions into JavaScript native types. This 
	means you should no longer need to write code like this: 
	String(someObj.toString())
* added String.hashCode function. This is the same as Java's 
  String.hashCode function; it creates a fast numeric hash of the 
	string. This does not replace the cryptographic String.toHash function
* Added $server.resolveUrl(path) function. This converts a URL path 
  relative to the current directory into an absolute URL, including the 
	server part. 
* Added logging for Myna.executeShell when the result contains errors	

----------------------------------------------------------

Release Name: 1.0_alpha_16
============================
Notes:

This release sees improvements in the threading API and the completion of fragment and query caching

New in this release:
--------------------

* **Fragment and query caching** 
  
  Fragment and query caching has eveolved from the partially
  completed state in `1.0_alpha_15-1`. Now caching is handled via 
  [Myna.Cache] like so:

        Myna.println("This line is not cached");
        var result = new Myna.Cache({
            name:"test",
            tags:"test,query,output",
            refreshInterval:Date.getInterval(Date.MINUTE,3),
            code:function(sleepTime){
                //an artificially long process
                Myna.sleep(Date.getInterval("s",sleepTime));
                Myna.print("this line is cached: " + new Date())
            }
        }).call(10)

  Queries can also be cached by including a "cache" option with the
  same parameters as Myna.Cache()

        //cache employee information for 12 hours
        var qry=new Myna.Query({
            ds:"hr_ds",
            sql:"select * from employees",
            cache:{
                refreshInterval:Date.getInterval(Date.HOUR,12)
            }
        })               
  
  There is now a check during cache creation for free memory. if less than 20% of [memMax] is available, the caching system will attempt to release the least recently used cache objects until memory usage drops below this threshold. This should reduce the danger of runaway caching. You can also use [Myna.Cache].maxIdleInterval  to preemptively release the memory of infrequently used cached objects based on idle time.

  See [Myna.Cache] and [Myna.Query] for more information

  [Myna.Cache]:http://www.mynajs.org/shared/docs/js/libOO_raw/files/Cache-sjs.html
  [Myna.Query]:http://www.mynajs.org/shared/docs/js/libOO/files/Query-sjs.html
  [memMax]:http://www.mynajs.org/shared/docs/js/libOO_raw/files/standard_objects/server-sjs.html#$server.memMax

* Added static function [Array.parse()]. This takes an Array-like object and 
  returns an array of the contents

  [Array.parse()]:http://www.mynajs.org/shared/docs/js/libOO_raw/files/Array-js.html#Array.parse

* Replaced getLock and attemptLock with [Myna.lock] (name,timeout,function). When
  the supplied function is complete, the lock is released automatically. Passing  a timeout of 0 will will only lock if no other thread currently has a lock

  [Myna.lock]:http://www.mynajs.org/shared/docs/js/libOO_raw/files/Myna-sjs.html#Myna.lock


* Myna.[Thread] function can now return values. This will be returned from 
  [Thread].join(), or can be accessed via [Thread].getReturnValue()

  [Thread]:http://www.mynajs.org/shared/docs/js/libOO_raw/files/Thread-sjs.html

* Added Myna.[Thread].joinAll(). This is a static function that calls join() on  all the threads spawned from the current thread, and returns an array of their  return values

Other Changes:
--------------

* Replaced Myna.cacheValue and Myna.cacheOutput with Myna.Cache. This allows for
  other threads to manipulate cache contents
* Object.setDefaultProperties now returns the modified object so this can be 
  chained  
* Added String.escapeRegex() to escape regex characters in strings
* Fixed bug in DataSet.findFirst() and .findAll() where string compares were 
  matching partial matches and failing on strings that contained regex 
  characters 
* added optional 'message' argument to .requestBasicAuth
* fixed various bugs related to making Queries into DataSets
* Upgraded JCS to 1.3.3.5RC
* Added Date.formatInterval(). This a static function that takes a time interval 
  in milliseconds and formats as a human readable string 
* Changed Cache.inteval to to Cache.refreshInterval
* Added Cache.maxIdleInterval. This is the amount of time a cache value can be 
  idle before being garbage collected



------------------------------------

Release Name: 1.0_alpha_15-1
============================
Notes:

This is a BugFix release that also introduces some experimental features


New in this release
-------------------

* Compiled script caching: 
  * Fixed a bug in script caching that was disabling it. 
    Fixing this improves speed by about 10%. This also make selecting higher 
	 optimization levels more practical. Prior to this change optimization 
	 levels > -1 typically slowed down execution
  * Modified caching algorithm.
    Now file and script caching are separated. This means that script fragments
	 that are not associated with a path are cached. Furthermore, there is now a 
	 disk cache that prevents Myna from reading a script file unless it it has 
	 changes newer than the cached copy. This can dramatically improve 
	 performance when disk is slow and or experiencing high I/O load
* Added Myna.println() and Myna.printDump();
* Added static function Date.getInterval(). This is similar to 
  Date.prototype.add(), but instead of returning a new Date instance, this 
  returns the interval in milliseconds. This interval can later be passed to 
  Date.prototype.add to do the actual date math.
* Added Myna.lock(name,timeout,func). This halts the current thread for up to 
  *timeout* seconds until a named lock is available and then runs *func*. Calling 
  release() on the returned lock allows the next thread to acquire a lock
* Added Myna.cacheOutput() This allows you cache fragments of your pages that
  don't change very often. 
* Added Myna.cacheValue() This allows you cache function results that don't 
  change very often. 
* BugFix: schemas now better supported in Myna.Table and Myna.DataManager

--------------------------------------

Release Name: 1.0_alpha_15
============================
Notes:

New Features:
   * Added support for auth adapters. 
     These are customizable authentication 
	  modules that can be used with Myna's permissions system or separately. An 
	  adapter is a combination of a auth_type config file 
	  ( /WEB-INF/myna/auth_types/) and an implementation 
	  (/shared/js/libOO/auth_adapters). Myna currently comes with 3 
	  implementations (server_admin, myna, and ldap) and 2 pre-defined auth_types 
	  (myna and server_admin). auth_types are analogous to DataSources and 
	  auth_adapters are analogous to database drivers. Here is an example of 
	  authenticating a username and password against the server_admin adapter:
	  
	  (code)
		var adapter = Myna.Permissions.getAuthAdapter("server_admin");
		var adminPassword ="...";
		if (adapter.isCorrectPassword("admin",$req.data.password)){
Myna.print("is good")	
		} else {
Myna.print("is bad")
		} 
	  (end)

	  An even more powerful way to use adapters is in conjunction with the 
	  permissions system. Here is an excerpt from the db_manager authentication 
	  function:
	  
	  (code)
	  var user = Myna.Permissions.getUserByAuth(data.username,data.password)
		
		if (user){
$cookie.setAuthUserId(user.get_user_id());
if (user.hasRight("myna_admin","full_admin_access")){
	 print({success:true,url:"?fuseaction="+$application.mainFuseAction}.toJson());
} else {
	 print({success:false,errorMsg:"You do not have access to this application."}.toJson());
}
		} else {
$session.clear();
$cookie.clearAuthUserId();
print({success:false,errorMsg:"Login invalid. Please try again."}.toJson());
		}
	  (end)
	  
	  Myna.Permissions.getUserByAuth(username,password[,auth_type]) attempts to
	  authenticate against the indicated adapter, and then look up and return the 
	  associated user for that login. We can then check to see if that user has
	  any rights in this application. Calling getUserByAuth without specifying an
	  adapter, as in the code above, causes myna to authenticate against every 
	  available adapter until there is a match. Matching more than one user is 
	  considered a failure since Myna cannot tell which login is correct. Because 
	  a User can have many logins, it is possible for a given user to 
	  authenticate successfully via more than one adapter. For example, a user 
	  may have a local Myna login and an Active Directory (ldap) login.
	 
	  See: 
	  	* http://www.mynajs.org/shared/docs/js/libOO/files/auth_adapters/auth_adapters-txt.html
		* http://www.mynajs.org/shared/docs/js/libOO/files/auth_adapters/ldap-sjs.html
	  
   * Web Service Changes
	  * Added dynamic HTML documentation of WebServices. Connection to a WebService 
       without specifying URL or FORM parameters will display the documentation.
	  * Added new extension ".ws" for WebService files. This is now the official 
	    way to create WebServices. The only contents of the file should be the 
		 WebService config itself. See http://www.mynajs.org/shared/docs/js/libOO/files/WebService-sjs.html#Myna.WebService.WebService
		 
	* Improved Examples
	  Myna examples have been re-organized and indexed. To see the new UI for 
	  examples, see the "Examples" link in the Myna administrator. Executing 
	  examples now requires admin access to avoid security vulnerabilities
	  
	* Added ETag support. This means that if the content just generated matches the 
	  If-None-Match header from the browser, a "304 Not Modified" is returned 
	  instead of the content. This saves network traffic.
	  
Other Changes:

* Modified Administrator to authenticate against any available adapter
* Changed upgrade_tables.sjs to pre-populate an Admin user with user ID
  "myna_admin" and a login "Admin" Also created the group "Myna Adminstrators"
  with myna_admin and the right "full_admin_access". This allows the server
  admin user to be treated the same as any other user
* added DataSet.map(). This does the same thing as Array.map but it returns a 
  Myna.DataSet
* added Permissions.getUserGroupsByAppname() and getRightsByAppname() 
* added improved support for ActiveDirectory to ldap adapter
* Created JavaUtils.createClassArray for creating Java arrays of any class 
* added Ext.Direct example directory with very basic example in 
  examples/ext_direct
* added WebService example in /examples/web_service
* re-organized generated docs
* Modified debug_window to only enumerate non-function properties
* modified request_handler to not serve direct calls to application.sjs. 
* modified Myna.Dump to only include the root caption if a label is defined
* added Ext.Direct tree demo: /examples/ext_direct/ext_direct_tree.ejs
* added /examples/index.ejs which is an index of the code examples
* Added link to Myna administrator to examples index
* broke sql_examples into several examples in /examples/sql_examples
* removed text including ability from Myna.include()
* added Myna.includeText() for calling $res.print with the text of a file 
   
    
-----------------------------------

Release Name: 1.0_alpha_14
============================
Notes:

New Features:
    * More Support for XML:
          o Added getContentXml() to Myna.HttpConnection. This returns an E4X XML object
          o Modified ObjectLib.getKeys() and Object.getKeys() to ignore non-numeric properties on XML objects. This makes it possible to call forEach() on XML objects like so:

              
              rss..item.forEach(function(item){ 
                Myna.print("Title: " + item.title)
              })

          o Added String.toXml() to create an E4X XML object from a string

    * Added Ext.Direct remoting support to WebService
      Ext.Direct is Ext's RPC protocol. The basic idea is to create local functions in your client-side JavaScript that know how to call your server-side code and return a response. Another powerful feature is the ability to batch several of these function calls into one request behind the scenes which can dramatically improve performance in AJAX heavy applications:
      Intro:
      http://extjs.com/blog/2009/05/13/introducing-ext-direct/

      Demos:
      http://extjs.com/deploy/dev/examples/samples.html#sample-13

      Server-side spec:
      http://extjs.com/products/extjs/direct.php

      Myna implements this as another protocol for Myna.WebService. This means that the same WebService instance can answer requests via SOAP, XML-RPC, JSON-RPC, JSON-MYNA and now Ext.Direct.

      Here is an example from the Myna documentation (http://www.mynajs.org/shared/docs/js/libOO/files/WebService-sjs.html#Myna.WebService.printExtApi)

          
      /* creates a global MyServiceAPI variable containing
      	the Ext.Direct API via script include */
      <script src="http://myhost.com/myservice.sjs?ext-api&scriptvar=MyServiceAPI"></script>

      <script>
      	Ext.Direct.addProvider(MyServiceAPI);

      	MyService.someFunction(arg1,arg1,function(response){
      		alert(response);
      	})

      </script> 

    * Redesigned Strict validation mode.
      "Strict Error Checking" in the Myna Administrator has been renamed to "Strict Syntax Warnings", and the behavior is now to log warnings rather than throw errors. This dramatically improves compatibility with third-party libraries
    * Object functions are now hidden.
      Added ObjectLib.hideProperty and Object.hideProperty(). Also hid all the Object prototype functions. This means than for (var in obj) should now work as expected. Thanks to Raphael Speyer and Martin Blom for explaining how Rhino property attributes work



Other Changes:

    * When setting query parameters, empty strings are now considered NULL
    * Calling Myna.log() from inside a running thread, now runs log() inside that  thread instead of spawning another thread
    * Made file path in H2 datasources relative to the context root, if not an  existing path on the filesystem. This means that an installation of Myna can be copied to another folder and file-based datasources should still work
    * Modified onApplicationStart to be more reliably called
    * Added code to create /WEB-INF/classes/cron.properties if missing
    * Made ServerJS support available through Myna.enableServerJS() This allows conditional loading via application.sjs
    * upgraded Narwhal to latest in GIT and added Windows support for filesystem operations
    * added File.appendString() and File.appendBinary()
    * added File.getLineIterator() for reading a file one line at a time
    * Added new properties to File: directoryPath, fileName, type, size, and  lastModified
    * Modified File.listFiles() to return a Myna.DataSet of the files.
    
-----------------------------------

Release Name: 1.0_alpha_13
============================
Notes:

New Features:

    * Added Array aggregate functions: min, max, sum, and avg
    * Added support for Myna.DataSet, an extension of Array for managing arrays 
    of objects, optionally with a loader function. DataSets bring the data 
    handling of query result sets , without requiring a query. Here are some 
    examples of DataSet in action:

//Create Dataaet from a regular array:
var DS = new Myna.DataSet([{dude:"bob"},{dude:"bob2"}])

//Create DataSet from a loader:
DS = new Myna.DataSet({
    columns:"label,value",
    loader:function(options){
        return Array.dim(options.maxRows).map(function(d,index){
            return {
                value:index+options.startRow,
                label:"Label #" +(index+options.startRow)
            }
        })
    }
})
DS.load({startRow:1,maxRows:10}); //load the first 10 rows
DS.load({startRow:11,maxRows:10}); //replace with the second 10 rows

//Create DataSet from a Query:
var DS = new Myna.Query({
 ds:"myna_log",
 sql:"Select * from myna_log_general",
 maxRows:10
}).data
//Query.data is now a DataSet

//DataSets have several functions that make them easier to work with:

//returns an array of all values in the "request_elapsed" column
DS.valueArray("request_elapsed"); 

//returns the row that contains The highest request elpased time 
DS.maxByCol("request_elapsed"); 

//treat the DataSet as a hashtable via any column
var bob = DS.findFirst("employee_id",/123658332/)

    *
    * Added PUT and DELETE methods to HttpConnection. This can be helpful for 
      calling RESTful services
    * Added Global server scope via $server.set(key,value) and $server.get(key). 
      Values set in the server scope are persisted between requests until the 
      server (JVM) is restarted
    * Added findBeans to DataManager. This works like manager.find() except it 
      returns a DataSet of bean objects instead of just the ids
    * Modified Myna.DataManager.ManagerBase to have setters and getters for each 
      column that call the the appropriate set_<column> and get_<column> 
      functions. This means you can use the aggregate functions:

      var avgOrder = orderManager
                    .findBeans({customer_id:"1234567"})
                    .avgByCol("order_total")

    * Added Myna.DataManager.BeanBase.getParent(). this function attempts to 
      retrieve the parent bean for this bean via a foreign key.

       
      var orderBean = new Myna.DataManager("myapp")
                      .getManager("orders")
                      .getById(curOrderId);
      var customerBean = orderBean.getParent("customer_id");
      Myna.print(customerBean.last_name);

    * Added getChildren to DataManager.BeanBase.prototype. This returns a 
      DataSet of matching beans in the supplied child table

       
      var customerBean = new Myna.DataManager("myapp")
                         .getManager("customers")
                         .getById(curCustomerId);
      var orders = orderBean.getChildren();
      Myna.print("Orders Total: " +orders.sumByCol("order_total")); 

Other Changes:
    * Altered "Append Profiler Output" setting to log to myna_log_general 
      instead of  appending to page output. Altered setting name and help text 
      to "Log Profiler Output"
    * Updated docs for HttpConnection
    * Removed error when a Thread calls itself.    
    * Updated Thread docs
    * Improved error logging in threads
    * Fixed bug in Myna.JavaUtils.beanToObject
    * Modified Myna.Dump to handle DataSet objects



	
-------------------------------------------------------------------------------
Release Name: 1.0_alpha_12
============================
Notes:

New Features:
	* Upgraded to Rhino 1.7R2
		See https://developer.mozilla.org/en/New_in_Rhino_1.7R1
		and https://developer.mozilla.org/en/New_in_Rhino_1.7R2
		
	* Many improvements to DB Manager:
		* added tab support. Pressing tab will indent in sql windows
		* Right clicking a table and selecting "Query" will now generate formatted SQL
that aliases the table name and refers to the columns by the aliased table 
name. If the table is in a named schema, then schema name is prepended to 
the table name
		* Support for editing tables:
Can create and modify tables, their columns and their primary and 
foreign keys. Try right-clicking an existing table and select 
"Edit Table". Both myna and SQL code is generated when you edit tables

	* REST support. 
		This makes it possible to pass simple parameters 
		to a script page that look like sub directories to the caller. Here is an 
		example, assuming "context" is the servlet context myna is installed to: 
		
		Original URL: 
		http://mynajs.org/context/my_blog/articles.sjs?category=12&section=215&id=16
		
		URL mapped version:
		http://mynajs.org/context/URL-MAP/my_blog/articles.sjs/category/12/section/215/id/16
		
		If you don't provide a value for the last parameter, it will be "".
		This is also useful for serving binary content with familiar URLs,
		like so:
		
		<img src="/context/URL-MAP/images/image_loader.sjs/id/23345/img.jpg"/>
		
		Some browsers e.g Internet Explorer, ignore the mime type of
		downloaded files in favor of windows extension mapping. For IE a URL
		like this works much better:
		
		<a href="http://mynajs.org/context/URL-MAP/my_app/fusebox.sjs/
		fuseaction/download_report/id/56343/report.xls">Download as Excel</a>
		
		This can also be used to secure sensitive downloads. Here is an
		example of authenticated access to images, using the example above:
		<img src="/context/URL-MAP/images/image_loader.sjs/id/23345/img.jpg"/>
		
		then image_loader.sjs might look like this:
		
		if ( ! ($req.authUser =="admin" && $req.authPassword=="secret")){
$res.requestBasicAuth("Enter the secret password")
		}
		
		$res.printBinary(new Myna.File("file:/mnt/secret_stuff/images/image_"
		+ $req.data.id + ".jpg").readBinary(),"image/jpeg");

		Also added PUT and DELETE support. You can tell whether a request was called 
		via GET, POST, PUT, or DELETE by checking $req.type
		
	* Experimental ServerJS support
		Myna now comes bundled with the Narwhal Java implementation of ServerJS.
		Learn more about ServerJS: https://wiki.mozilla.org/ServerJS
		and Narwhal: http://narwhaljs.org/
		
	* Added Number.js which currently only contains the Ruby-like times() 
		prototype function. This is used to replace 
		
		for (var x=0; x < 10; ++x){
doStuff(x)
		}
		
		with 
		
		(10).times(function(x){
doStuff(x)
		})
		
	* Added Array.dim(count). This function returns an array of size count with null
		values. This is useful for initializing an array like so:
		
		var tenStrings = Array.dim(10).map(function(alwaysNull,index){
return "String " + index++;
		}
		
Other Changes:
	* Myna now requires at least a 1.5 JVM. 
		The major reason for this is the deprecation of the 1.4 JVM by the Rhino
		team. It is getting harder to find libraries compatible with the older
		JVM's 
	* added Rhino features: FEATURE_LOCATION_INFORMATION_IN_ERROR and 
		FEATURE_ENHANCED_JAVA_ACCESS These should improve Myna's error handling, 
		especially java exceptions
	* Request timeouts and "stopping" running requests from the administrator are 
		now handled via Context.ObserveInstructionCount(). This is makes thread 
		termination far more reliable, and generates a catchable error that is 
		logged. "killing" threads from the Administrator now calls 
		Thread.interrupt() followed by Thread.stop()
	
-------------------------------------------------------------------------------
	
Release Name: 1.0_alpha_11
============================
Notes:

Changes in this release:

	* New Feature: Myna Permissions
		The functions and classes in Myna.Permissions combined with the web 
		application located at MynaRoot/myna/permissions/index.ejs form
		Myna's permissions system. The purpose of the permissions system is to
		provide a standardized and centralized system for managing users and 
		their rights in your applications.
		
	* Major Change: Myna.Thread
		Myna.Thread has been completely overhauled and implemented in Java. Threads 
		now perform reliably and without memory leaks
		
	* Major Change: Scheduled tasks
		Scheduled tasks are now handled by their own Java class: CronThread and
		run a URL instead of a script. This change was made to reduce the resources 
		used by cached db connections, etc, but it has several other advantages 
		including the ability to schedule tasks on other servers, and full access to 
		the standard objects. One	 negative side effect is that any existing 
		scheduled tasks will need to be converted and re-entered 
		
	* Minor Features:
		* added $application.directory	property 
		* Myna now initializes at server start-up. This allows scheduled tasks to 
start up without the need for a request. This also reduces the "startup 
lag" of the first request after server start-up
		* added Myna.WebService.generateQueryType. This is a static function that 
automates the construction of a query result for use in the	 "returns" 
section of a web service function definition
		*		Added new WebService Instance functions: setAuthUserId and 
clearAuthUserId. These are front ends to $cookie.setAuthUserId and 
$cookie.clearAuthUserId. 
		* Myna.HttpConnection improvements
		* Added DataManager.find() function. This can be uses to find a row by 
primary key, or all rows that match a certain criteria
		* Added $cookie.clear() function which immediately expires a cookie
		* Myna.log now runs in a separate, low priority thread. This ca n have a 
dramatic affect on request time when there are a lot of logs.
		* Added Myna.Query.result property, an object that contains just data result 
of the query, and a JS friendly column description. 
		* Added Myna.Query.dateFormat property. When set, Queries will automatically 
format date and time values 
	
-------------------------------------------------------------------------------
	
Release Name: 1.0_alpha_10
============================
Notes:

New Features in this release: (see below for details)
	* Added publish support for 4 types of web services 
		(SOAP,XML-RPC,JSON-RPC,JSON-MYNA)
	* Added Myna.HttpConnection Class
	* New $req Features
	* Unit Test Framework
	* Myna Administrator: Instance settings and Thread Inspection
	* UI improvements
	* New Myna.String functions
	* Added Myna.JavaUtils

Feature Details:
	* Added publish support for 4 types of web services:
The Myna.WebService class provides a way to define a generic web service 
object. This object can then be accessed via any of the supported 
protocols (SOAP,XML-RPC,JSON-RPC, or JSON-MYNA). Here is a quick example:

<File: emp_manager.sjs>
var ws = new Myna.WebService({
		name:"emp_manager",
		desc:"Employee utility functions",
		functions:{
	get_bob{
desc:"Always returns bob",
returns:{
		name:"string",
		age:"numeric",
		children:[{
	name:"string",
	age:"numeric"
		}],
		favorite_colors:["string"]
},
params:[{
		name:"employee_id",
		type:"numeric"
}],
handler:function(employee_id){
		return {
	name:"Bob Dobb",
	age:"44",
	children:[{
name:"julie",
age:9
	},{
name:"sam",
age:13
	}],
	favorite_colors:["yellow","green","blue"]
		}
}
	}
		}
})
ws.handleRequest($req);

handleRequest will examine $req and:
* If $req.data.wsdl is defined, a SOAP WSDL document is printed. 
* If $req.data.soap is defined, the XML content is interpreted as a SOAP	
	request and a SOAP envelope is printed
* If $req.data.xml-rpc is defined, the XML content is interpreted as an 
	XML-RPC request and an XML-RPC response is printed
* If $req.data.json-rpc is defined, the text content is interpreted a
	JSON-RPC request and an JSON-RPC response is printed
* If $req.data.json-myna is defined, the text content is interpreted a
	JSON-MYNA request and a plain JSON response is printed
	
WebService calls can be restricted by HTTP BasicAuth or cookies
	* Added Myna.HttpConnection Class
This class allows you to make and http call to a server and retrieve the
content. This class supports HTTP BasicAuth as well.

	* New $req Features:
* Added HTTP BasicAuth Support
	$req.authUser and $req.authPassword will automatically be populated 
	from the HTTP Basic Auth header, if provided. $res.requestBasicAuth() 
	will present a login dialog to the user
* $req.headers:
	a JavaScript Object where the properties are header names and the 
	property values are an array of strings containing each of request 
	header's values
* contentText
	content of the request body as a string
* contentXml
	content of the request body as an E4X XML() object
* contentByteArray
	content of the request body as a Java byte[]
* contentType
	content type of the request

	* Unit Test Framework
JsUnit 1.3 (http://jsunit.berlios.de/) is installed in /shared/js/jsunit,
with slight modifications to support the myna environment. Testcases are 
being developed in /myna/tests.
	
	* Myna Administrator: Instance settings and Thread Inspection
* The new general property "Instance Name" can help distinguish multiple 
	instances running on the same server. 
* The new general property "Instance Purpose" can help identify instances 
	on different servers that are serving the same content
* The new general property "Send email to administrator on uncaught 
	exceptions?" does what is says, sends a formatted error to 
	"Administrator Email" on uncaught exceptions
* Thread Inspection: the Running Requests Tab now has a link labeled 
	"explore" for each running request. Clicking this allows you to execute 
	arbitrary JavaScript code in the scope of the running request. 
	
	* UI improvements
* Upgraded to Ext 2.2
* Added "slate" theme (Thanks to J.C Bize 
	http://extjs.com/forum/member.php?u=3697) 
* Added FAMFAMFAM "silk" open source icons to shared/images/famfamfam_silk.
	(Thanks to Mark James http://www.famfamfam.com/lab/icons/silk/)

	* New Myna.String functions
* listMakeUnique
	returns new list (string) with each item represented only once
* listMakeUniqueNoCase
	returns new list (string) with each item represented only once, regardless of case. 
* listSort(compareFunction)
	returns a copy of this list sorted by the supplied compare function
	
	String Compare functions(used for String.listSort and Array.sort)
		* compareNaturalReverse
		* compareAlpha
		* compareAlphaReverse
		* compareNumeric
		* compareNumericReverse
		
* listToArray
	returns an array of the items in this list
		
	* Added Myna.JavaUtils
		This library is for Java utility functions. The following functions were 
		copied from Myna.sjs:
		
		* beanToObject
		* createSyncFunction
		* createByteArray
		* createCharArray
		* enumToArray
		* mapToObject
		
		These NEW functions were added to the library:
		
		* readerToString
returns a JavaScript String containing the entire contents off the 
supplied Java Reader.
		* streamToString
returns a JavaScript String containing the entire contents off the supplied Java 
		* streamToByteArray
returns a Java byte[] containing the entire contents off the supplied Java InputStream.
		* readerToByteArray
returns a Java byte[] containing the entire contents off the supplied Java Reader.
		
-------------------------------------------------------------------------------

Release Name: 1.0_alpha_9
============================
Notes:

**** New Feature: Database Management	 ****
The major focus of this release is database management. 
	*	 Datasources of type other than "other" now have network settings and or 
		 file settings and will automatically populate the driver and url settings.
	*	 From the Myna Administrator, you can click "Manage DB" to open Myna
		 Database Administrator, where you can run queries, create and drop tables,
	 and create modify and delete columns
	*	 Underneath the Database Administrator are the new classes Myna.Database and
		 Myna.Table. 
	*	 Myna.Database contains metadata about the datasource and uses the files in
		 /shared/js/libOO/db_properties to normalize DDL SQL between different 
	 databases. Files for H2, Oracle, PostgreSQL, MS-SQL, and MySql are provided
	 but others can easily be added
	*	 Myna.Table uses these settings to provide the ability to create, modify and
		 drop tables, including indexes and foreign keys. This makes it possible to
	 write table creation code that can be applied to arbitrary databases

	 
**** New Feature: Database Logging	****
Myna.log() will log to the myna_log_general table in the myna_log datasource.
This datasource is created automatically if it does not exist. If the 
myna_log_general table does not exist, it is created, so any database can be 
used to store logs. See View General Log in Myna Administrator to view logs


**** Improved Error Handling ****
All uncaught exceptions, both run-time and compile-time are now logged to 
myna_log_general. You can override $application.onError to intercept errors. 
Returning false cancels error display. See Myna.formatError() for the new error 
formatter.

**** New Package: myna_server	 ****
Starting with this release there is also server edition that comes with the 
winstone servelet engine. Simply unzip this file and run either 
start_myna.bat (windows systems) or sh start_myna.sh (unix like systems)

Other Features:
* Updated BLOB and CLOB read and write support
* modified request workflow so that the initialization of scopes is handled 
	before parsing application.sjs files. This means it is now possible to 
	manipulate contents of scopes (such as $req.data) from an application.sjs 
	file.
* Added String.repeat(count,delimiter,qualifier) function
* Created /shared/js/libOO/Function.js. This includes Function prototype 
	extensions from Ext
* Added property $req.id in standard_objects.sjs. This is a UUID to uniquely 
	identify this request
* Modified Myna.Thread to add priority parameter. This is relative (+/- 100%)
	modification of the thread's priority.	
* added jtds.jar for MS-SQL support
* added "gt,gte,lt,lte" keywords to <@if>. Use these in place of ">,>=,<,<=" 
	in <@if> and <@elseif> ejs statements
* added new String functions:
	* listContainsNoCase
	* listFindNoCase
	* listAppendNoCase
	* listAppendUnique
	* listAppendUniqueNoCase
	* listBefore
	* listAfter
* added /shared/js/libOO/debug_window.js. This file defines the client-side 
	debug_window() function. This file is also included in client.sjs
* modified Myna.Query:
	* added ds parameter as an alias for dataSource
	* added rowHandler parameter
	* added defaultRowHandler function. Overriding the default row handler 
		allows the programmer to process the row before it is added to 
		Myna.Query.data 
* added instance_id property to general settings

-------------------------------------------------------------------------------

Release Name: 1.0_alpha_8 
============================
Notes:

**** New Feature: Asynchronous Threads ****
You can now execute a javascript function in a separate thread. The new thread 
will run in the background, but will have access the the originating thread's 
scope, event after the original request exits. Here is an example:

var file = new Myna.File("/test_file.txt");
new Myna.Thread(function(){
	$profiler.mark("sleeping"); //this will show up as "Current Task" in the administrator
	java.lang.Thread.sleep(60*1000); //sleep for one minute
	
	file.writeString(new Date())
})

$res.print("Will write to file '" + file.toString() +"' in about a minute");

Note that there is no output from an asynchronous thread. Any results from 
threads should be written to shared storage such as $session.set(), 
$application.set(), filesystem or database.


**** New Feature: Request Timeout ****
Myna will now try to terminate long running requests. To set the default timeout 
see General Settings, Default Request Timeout in the Myna Administrator. Any 
request can adjust its own timeout by setting $req.timeout to a larger or 
smaller value. The termination are implemented as a Scheduled Task, see below 


**** New Feature: Scheduled Tasks ****
Scheduled Tasks are "headless" scripts that are run on a schedule. This is 
similar to to the UNIX cron systems or the Windows Task Scheduler. They are 
useful for tasks that are not related to user input such as:

	* Refreshing caches 
	* Checking for new files in an ftp directory 
	* Sending a daily email
	* Generating a report
	* Truncating log files or database tables
	
Currently the "kill_long_running_requests" task runs every 5 seconds to stop 
threads that have exceeded their $req.timeout setting 
	

**** New Feature: Templates ****
Myna.Template and Myna.XTemplate are classes based on the Ext classes of the 
same names. These offer a pure java alternative to <ejs></ejs> blocks. Here is 
a quick example:

var qry = new Myna.Query({
	dataSource:"someds",
	sql:"select first,last,age from people"
})
var tpl = new Myna.XTemplate(
	'<table width="100%" height="1" cellpadding="0" cellspacing="0" border="0" >',
		'<tr>',
'<th>First Name</th>',
'<th>Last Name</th>',
'<th>Age</th>',
		'</tr>',
		'<tpl for="data">',
'<tr>',
	'<td>{first}</td>',
	'<td>{last}</td>',
	'<td>{age}</td>',
'</tr>',
		'</tpl>',
	'</table>'		
)

$res.print(tpl.apply(qry));

**** New Feature: Query Named Parameters ****
This is an alternative way to set parameters for a query. Here is an example:

var insertQry=new Query({
	dataSource:":mem:",
	sql:
	'insert into event (			 '+
		'event_type_id				,'+
		'app_name					,'+
		'app_purpose				,'+
		'label						,'+
		'detail						,'+
		'event_ts					,'+
		'request_elapsed			 '+
	') values (						 '+
		'{event_type_id:bigint}		,'+
		'{app_name}					,'+
		'{app_purpose}				,'+
		'{label}					,'+
		'{detail:clob}				,'+
		'{event_ts:timestamp}		,'+
		'{request_elapsed:bigint}	 '+
	');', 
	
	values:{
		event_type_id:$req.data.event_type_id,
		app_name:$req.data.application,
		app_purpose:$req.data.purpose,
		label:$req.data.label,
		detail:$req.data.detail,
		event_ts:new Date(),
		request_elapsed:new Date().getTime() - $server_gateway.started.getTime()
	}
}); 

Note that the sql string contains placeholders for the parameters in the form of
{param_name:type}. If type is not defined, it is assumed to be varchar. Every
param_name is expected to be found in values, however any properties in values 
that are not param_names will be ignored.

insertQry can be executed again with different values:

insertQry.execute({
	values:{
		event_type_id:$req.data.event_type_id,
		app_name:$req.data.application,
		app_purpose:$req.data.purpose,
		label:$req.data.label,
		detail:$req.data.detail,
		event_ts:new Date(),
		request_elapsed:new Date().getTime() - $server_gateway.started.getTime()
	}
});	 

-------------------------------------------------------------------------------

Release Name: 1.0_alpha_7
============================
Notes:

**** New Feature: Request Management ****
Myna now limits the number of concurrent thread it will allow. To change this 
value, see "Max Requests" in General Settings. You can also white-list certain 
request patterns to avoid this restriction. Whitelisted requests have effectively 
higher priority and are more likely to work under high-load conditions. See 
"Thread Management Whitelist" in General Settings

There is also a new section in the administrator called "Running Requests" which 
gives a live view of all running and queued request threads. Threads can even be 
killed from here. 



**** New Feature: Email ****
Here is a quick example:

new Myna.Mail({
	to:"no-one@nowhere.info",
	from:"some-one@nowhere.info",
	subject:"Mail test",
	isHtml:true,
	body:<ejs>
		<table	border="1" >
<tr>
	<th >
		this..
	</th>
	<td> is HTML</td>
</tr>
		</table>
	</ejs>,
	attachments:[
		new Myna.File("/application.sjs"),
		"/shared/js/ext-2.0/resources/images/default/editor/tb-sprite.gif"
	] 
}).send()

See the SMTP Mail Host property in the administrator to set your relay host.



**** New Feature: parameter filtering ****
Myna now filters input through String.escapeHtml() This prevents a large number
of Cross Site Scripting (XSS) attacks with no extra effort by the developer. If 
you need access to un-altered parameters, they are available in $req.rawData 



**** New Feature: Myna.File.extractZip ****
Extracts a zip family archive (zip, gzip, jar, war, ear, etc) into a destination 
directory and returns an array of MyanPath strings representing the destination 
paths. Here is an example:

var entries = new File("/myna-1.0_alpha_6-1.war").extractZip("/upgrade_tmp");
$res.print("Extracted " + entries.length + " files.");


**** New Feature: Upgrade Myna ****
Myna can now be upgraded from a .war file in the administrator. When upgraded 
this way, only files that have been changed will be replaced, and replaced files 
are automatically backed up. See Help under "Upgrade Myna" in the administrator 


**** Updated Feature: Ext ****
The Ext (http://extjs.com) client-side javascript framework bundled with Myna 
has been updated to the stablw release version 2.0

-------------------------------------------------------------------------------

Release Name: 1.0_alpha_6-1
============================
Notes:
* Added tutorial section to documentation 
* Added documentation link to Administrator

-------------------------------------------------------------------------------
	
Release Name: 1.0_alpha_6
============================
Notes:
*** Major API change ****
The standard library now comes in two flavors: Procedural and 
Object-Oriented. 

Most of the old .sjs files found in /shared/js
can now be found in /shared/js/libproc. These files can be easily 
loaded by /shared/js/libproc/libproc.sjs. Adding this file to your 
shared scope should ensure compatibility for older code that depends
on the original procedural library. You can also includeOnce 
libproc.sjs in application.sjs of a directory to make the procedural
library available to a subset of your applications.

The new standard library is available in /shared/js/libOO/libOO.sjs.
This version does away with $lib in favor of enhancing the prototypes
for Object, String, Array, and Date. Functions and classes that do 
not map to these standard objects are stored in a global Myna object.
This makes it possible to chain several actions together in a more 
readable way. for example:

//old way
var userJson = $lib.string.toJsonString(user); 
var userEncrypted = $lib.string.encrypt(userJson,"mysecret");
$cookie.set("user",userEncrypted);

//new way
$cookie.set("user",user.toJson().encrypt("mysecret");

This is not only less typing, it also leaves no extra variables 
lying around to cause trouble. 

A consequence of adding functions to the object prototype is that for..in loops
may not have the items you expect. For example this code:

var empty = {}
for (var x in empty) Myna.print(x + "<br>");

prints:

getKeys
appendFunction
typeOf
checkRequired
setDefaultProperties
forEach
applyTo
toJson
getProperties

To get the intended behavior, use either Object.forEach() or Object.getKeys()

var bob ={
	id:12,
	name:"Bob",
	occupation:"being awesome",
	isDeceased:false
}
bob.forEach(function(element,name,object){
	Myna.print(name + ": " + element +"<br>");
});

var keys =bob.getKeys();
Myna.print("bob has "+ keys.length + " properties.<br>")

These new functions are packaged together in /shared/js/libOO/client.js for easy 
inclusion client-side. 

Have look at the js documentation in the "files" section: /shared/js/libOO for 
more detail.


*** Faster queries
Connections and complied sql statements are cached within each request so 
executing the same sql within a single request, even with different QueryParams,
will use the compiled sql. Another side effect of this change is that the JDBC
result set is now available on the query object as "resultSet"


*** New Feature: DataManager
The DataManager object provides a way to perform basic Create, Read, Update, and 
Delete (CRUD) operations against tables with a single primary key. Here is a 
quick example:
(code)
		+- - - - - - - - - - - - - - - - - -+
		| table employees					|
		+- - - - - - - - - - - - - - - - - -+
		| emp_id		int4	primary key |
		| fname		varchar				|
		| mname		varchar				|
		| lname		varchar				|
		| manager_id	int4				|
		| hire_date date				|
		+- - - - - - - - - - - - - - - - - -+

	var dm = new DataManager("hr_datasource");
	
	var empManager = dm.getManager("employees");
	
	var newEmpBean = empManager.create({
		fname:"Bob",
		lname:"Dobb",
		hire_date:Date.parse("02/21/1992","m/d/Y")
	})
	
	print (newEmp.get_emp_id()) // Prints the auto generated primary key
	newEmp.set_mname("R"); //sets this value in an update
	
	// you can also add your own functions to mangers and beans
	dm.subClasses.employeesBean = function(){}
	dm.subClasses.employeesBean.prototype.getBoss = function(){
		if (this.get_manager_id().length){
return this.manager.get_by_id(this.data.manager_id);
		}
	}
	
	var myBoss = empManager.get_by_id(1000012).getBoss();
(end)

Also check out empManager.columns for metadata about each column in the 
table, such as name, default value, size, type, nullable, precision and 
more.

*** Myna.ValidationResult ***
This object can store information about validation errors, and even merge 
multiple ValidationResults together. This is primarily used to store the results 
of an AJAX form post to return to the browser. The DataManager uses 
ValidationResult to store any	 validation errors, and ValidationResult.toJson()
returns a valid JSON object for Ext.

*** Ext web 2.0 framework ***
The Ext web 2.0 framework (version 2.0b1) is distributed with Myna as a 
convenience. The Myna Administrator is implemented in Ext but there are no other
dependencies on Ext. For more information see http://extjs.com

*** Date handling ***
Date handling is much improved by a modified version of Ext's Date.js. This 
brings PHP style date formatting and date parsing to the Date object. Other 
useful functions include Date.add() and Date.getDayOfYear(). See 
shared/docs/js/files/shared/js/libOO/Date-js.html to see all the new functions.

*** File Uploads ***
File Uploads are now working thanks to Apache commons-fileupload. Information 
about uploaded files can be found in
	$req.data.<fieldname> ={
		diskItem:item, org.apache.commons.fileupload.disk.DiskFileItem,
		stats:{
fieldName:String name of field in form,
fileName:String name of file on client side,
contentType:String mime type,
isInMemory:boolean, true if file contents are in memory,
sizeInBytes:int size in bytes,
diskLocation:String, the current location of the uploaded file
		}
	}
multiple uploads with the same fieldname are stored in 
$req.data.<fieldname>$array. See examples/file_upload.ejs and 
examples/file_upload_ext.ejs for examples and check out 
http://commons.apache.org/fileupload/apidocs/org/apache/commons/fileupload/disk/DiskFileItem.html
to see what you can do with a diskFileItem

-------------------------------------------------------------------------------
	
Release Name: 1.0_alpha_5
============================
Notes:
* New EJS macro <@loop array="array_expression" element="variable_name" [index="variable_name"]>.
	This macro has 3 attributes: array, element, and index, and basically 
	implements array.forEach(function(element,index){}). Index is optional.
	ex: 
		<@loop array="qry.data" element="curRow" index="rownum">
<tr>
	<td><%=rownum%></td>
	<td><%=curRow.first_name%></td>
	<td><%=curRow.last_name%></td>
</tr>
		</@loop>
* New EJS macros <@if boolean_expr >, <@elseif boolean_expr>, <@else>.
	These implement a decision structure. ex:
	<@if qry1.data.length>
		<h3><%=qry1.data.length%> rows displayed from query 1</h3>
	<@elseif	qry2.data.length>
		<h3><%=qry2.data.length%> rows displayed from query 2</h3>
	<@else>
		<h3>No rows to display.</h3>
	</@if>
* New EJS macro <@set assignment_expr>.
	Sets a variable in the form of 'var assignment_expr;'. the expression is 
	expected to NOT include a trailing semicolon. ex:
	<@set curData = curRow[curCol.name]> 

Have a look at examples/sql_example.ejs to see these in action

-------------------------------------------------------------------------------
	
Release Name: 1.0_alpha_4
============================
Notes:
Major changes include:
* Removed all dependencies on the servlet environment from MynaThread. This is in 
	preparation for asynchronous tasks
* Replaced Embedded JS Parser with one generated from Antlr. This has resulted in 
	a perfect match in line numbers in errors, and allows for more complicated
	grammar in the future (custom tags?). This does have an up front cost in 
	compile time.
* Added support for query parameters. See webdir/examples/sql_example.sjs
* Added $res.flush() function to send content to the browser before the end of 
	the request
	
-------------------------------------------------------------------------------
	
Release Name: 1.0_alpha_3
============================
Notes:
This release marks the completion of the Standard Library documentation, and the 
beginning of the general "getting started" docs. The profiler has been improved 
and several bugs are fixed.
