/*    Class: Myna.Ldap
        Represents a connection to an LDAP server
   
*/
if (!Myna) Myna={}

/* Constructor: Ldap
    Contructs a new Ldap connection
   
    Parameters:
        server                  -   *REQUIRED* Server and initial subtree to connect to.
                                        > ldap://server.yourdomain.com:389/o=top,ou=people
                                        > ldaps://server.yourdomain.com:636/o=top,ou=people
        username                -   Optional default null* 
                                    Fully qualified username to log in as
                                        > cn=name,ou=department,o=ldap_root
                                        > mporter@health
        password                -   *Optional default null* 
                                    password for user
        acceptSelfSignedCerts   -   *Optional default true* 
                                    By default secure ldap connections will 
                                    accept self-signed certs. Set this to false 
                                    to throw an exception. 

    Notes:
    If an AD style username is used (username@domain) then Active Directory paging mode is enabled. 
    This means that searches will be performed continuously over all pages until all results are gathered
    */
    Myna.Ldap = function(server,username,password,acceptSelfSignedCerts){
        if (acceptSelfSignedCerts === undefined) acceptSelfSignedCerts=true;
        this.server = server;
        this.user = username;
        this.password = password;
        
        var Context = Packages.javax.naming.Context;
        var directory = Packages.javax.naming.directory;
        var namingLdap = Packages.javax.naming.ldap
       
        var env = new java.util.Hashtable();
        //env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        env.put(Context.PROVIDER_URL, this.server);
        if (acceptSelfSignedCerts && /^ldaps/i.test(server)){
            env.put("java.naming.ldap.factory.socket", "info.emptybrain.myna.AcceptAllSSLSocketFactory");
        }
       
        
        env.put(Context.REFERRAL, "follow");

        if (this.user){
           env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, this.user);
            env.put(Context.SECURITY_CREDENTIALS, this.password);
        } else {
            env.put(Context.SECURITY_AUTHENTICATION, "none");  
        }
       
        // Create the initial context
        //var ctx = new directory.InitialDirContext(env);
        this.ctx = new Packages.com.sun.jndi.ldap.LdapCtxFactory.getLdapCtxInstance(this.server,env);
        $application.addOpenObject(this.ctx);
        if (/@/.test(username)){
            this.isAD = true
            this.pageSize=100
            var ctls = Myna.JavaUtils.createClassArray("javax.naming.ldap.Control",1)
            ctls[0]=new namingLdap.PagedResultsControl(1000, namingLdap.Control.CRITICAL);
            this.ctx.setRequestControls(ctls);
        }
        this.env = env
    }
   
/* Function: search
    Searches an LDAP repository
   
    Parameters:
        searchString    -     *REQUIRED* search to perform
                            > (cn=mporter)
                            > (&(orgcode=01018346)(positioncode=80569))
        attributes        -    *Optional default null* a comma separated list of attributes to
                            retrieve from the ldap server. If not specified, all attributes
                            are returned
    Returns:
        An array of ldap results that looks like this
        (code)
            result = (Array)
            |
            +--[0] = (Object)
                |
                +-- name = (String) fully qualified name of result node
                |
                +-- attributes = (Object)
                    |
                    +--<attribute name> = (Array)
                        |
                        +--[0] = (String)
        (end)
     
    */
    Myna.Ldap.prototype.search=function(searchString,attributes,maxRows){
        if (!attributes || !attributes.length) attributes =null
        maxRows = maxRows||2147483647
       
        if (typeof attributes == "string"){
            attributes = attributes.split(/,/);
        }
       
        var Context = Packages.javax.naming.Context;
        var directory = Packages.javax.naming.directory;
        var namingLdap = Packages.javax.naming.ldap
        var ctx = this.ctx;
        var env = this.env;
        var ctls = new directory.SearchControls();
        ctls.setReturningAttributes(attributes);
        ctls.setSearchScope(directory.SearchControls.SUBTREE_SCOPE);
       
        
       
        var result=[];
        var cookie;
        function importResults() {
            var namingEnum = ctx.search("", searchString, ctls);
            while (namingEnum.hasMoreElements()){
                var curObj = namingEnum.next();
                if (result.length <= maxRows){
                    result.push({
                        name:String(curObj.getName()),
                        attributes:function(curObj){
                            var attributesArray=Myna.enumToArray(curObj.getAll());
                            var attributesObject ={}
                            for (var x = 0; x < attributesArray.length; ++x ){
                                var array = Myna.enumToArray(attributesArray[x].getAll());
                               
                                attributesObject[attributesArray[x].getID()] = array.map(function(element){
                                    return String(element);
                                });
                            }
                            return attributesObject;
                        }(curObj.getAttributes())
                    })   
                }
            }    
        }
        var quit=false
        importResults()
        if (this.isAD){
            do {
                if (result.length == maxRows) return result
                // examine the response controls
                ctx.getResponseControls().toArray().filter(function (tuple) {
                    var control = tuple.value
                    //Myna.printDump(control);
                    cookie = control.getCookie()
                    //Myna.printConsole(control.getResultSize());
                    //Myna.printConsole(control.getCookie());
                    
                })

                // pass the cookie back to the server for the next page
                requestControls = Myna.JavaUtils.createClassArray("javax.naming.ldap.Control",1)
                requestControls[0]=new namingLdap.PagedResultsControl(1000, cookie, namingLdap.Control.CRITICAL);
                this.ctx.setRequestControls(requestControls);
                importResults()
           } while ((cookie !== null) && (cookie.length != 0));

        }

        return result;
    }

/* Function: lookup
    Searches an LDAP repository for a specific entry
   
    Parameters:
        dn    -     *REQUIRED* full DN of target node, relative to initial context
                            > cn=mporter,ou=users
                            
        attributes        -    *Optional default null* a comma separated list of attributes to
                            retrieve from the ldap server. If not specified, all attributes
                            are returned
    Returns:
        if not found, throws javax.naming.NameNotFoundException

        If found, returns a single ldap result that looks like this
        (code)
            result = (Object)
                |
                +-- name = (String) fully qualified name of result node
                |
                +-- attributes = (Object)
                    |
                    +--<attribute name> = (Array)
                        |
                        +--[0] = (String)
        (end)
     
    */

    Myna.Ldap.prototype.lookup=function(dn){
        //strip base context, if necessary
        var baseContext = this.server.listLast("/").toLowerCase();
        //Myna.printConsole("baseContext",baseContext);
        if (dn.right(baseContext.length).toLowerCase() == baseContext){
            dn = dn.before(baseContext.length + 1)
        }

        var Context = Packages.javax.naming.Context;
        var directory = Packages.javax.naming.directory;
        var ctx = this.ctx;
        var env = this.env;

        var curObj = ctx.getAttributes(dn);
       
        //return Myna.printDump(Myna.JavaUtils.beanToObject(curObj))
        //return Myna.printDump(ObjectLib.getProperties(curObj))
        return {
            name:dn,
            attributes:(function(curObj){
                var attributesArray=Myna.enumToArray(curObj.getAll())

                var attributesObject ={}
                for (var x = 0; x < attributesArray.length; ++x ){
                    var array = Myna.enumToArray(attributesArray[x].getAll());
                   
                    attributesObject[attributesArray[x].getID()] = array.map(function(element){
                        return String(element);
                    });
                }
                return attributesObject;
            })(curObj)
        }
    }
