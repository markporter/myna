/* ------------- init ------------------------------------------------------- */
	function init(){
		this.addFields([
			{ name:"auth_type", idField:true, type:"string", defaultValue:""},
			{ name:"prettyName",  type:"string", label:"Display Name", defaultValue:"" },
			{ name:"desc", label:"Login Prompt", type:"string", defaultValue:"" },
			{ name:"adapter", type:"string", defaultValue:"" },
			{ name:"isNew", type:"numeric", label:"new?", defaultValue:0 }
		])
		
		this.deferred = true;
		this.beanClass.prototype.validate= function (config) {
			return Myna.Admin.authtype.validate(config)
		}

		/*after("validate",function (config) {
			var chain = arguments.callee.chain
			if (chain.lastReturn){
				return chain.lastReturn.merge(Myna.Admin.authtype.validate(config))
			} else return Myna.Admin.authtype.validate(config)
		})*/
		
		
		/* var testDs = this.get({name:"test_ds",desc:"test data source2",url:"bob",driver:"org.h2.Driver"})
		Myna.abort("this model",testDs.save()) */ 
	}
/* ------------- Methods ---------------------------------------------------- */

function create(config){

	var vr =Myna.Admin.authtype.save(config)
	if (vr.success){
		return this.getById(config.auth_type)
	} else throw vr
	
}

function forceDelete(auth_type){
	Myna.Admin.authtype.remove(auth_type)
}
function saveBeanField(bean,fieldName,oldval,newval){
	Myna.printConsole("auth type save bean filed"," ");
	var v = bean.validate(fieldName);
	/* 
	Don't actually save. Bean instances of this model are always deferred and
	must be saved via "save" which eventually calls "create"
	*/
	return v
}

function query(pattern,options){
	var $this = this;
	if (!pattern) pattern={}
	if (pattern.select == "*") delete pattern.select
	if (pattern.select) pattern.select = pattern.select.replace(/\s*/g,"")
	var criteria = pattern.filter(function(v,k){
		return !"select,where,orderBy".listContains(k)
	})
	var result= Myna.Admin.authtype.getAll()
	.filter(function(authtype){
		if (!criteria.getKeys().length) return true
		var ret= 
			criteria.getKeys()
			.every(function(key){
				if (typeof criteria[key] == "string"){
					return new RegExp(criteria[key],"i").test(authtype[key]||"")
				} else {
					return criteria[key] == authtype[key]
				}
			})
		return ret
	})
	.filter(function (authtype) {
		return !"myna,server_admin".listContains(authtype.auth_type)
	})
	.map(function(row){
		if (!pattern.select) return row
					
		return row.filter(function(v,k){
			return pattern.select.listContains(k)
		})
	})
	//Myna.printDump(result,"result")
	return new Myna.DataSet({
		columns:pattern.select||this.fieldNames,
		data:result
	})
}
