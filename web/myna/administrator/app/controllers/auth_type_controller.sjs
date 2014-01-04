/* ---------- list ---------------------------------------------------------- */
	function list(params){
		var searchParams={}
		if ("id" in params && !(this.model.idField in params)){
			searchParams[this.model.idField] = params.id	
		}
		this.model.fieldNames.forEach(function(name){
			if (name in params 
				&& params[name] 
				&& !"id,controller,action,$inline".listContains(name)
			){
				searchParams[name]=params[name];
			}
		})
		
		return this.model.query(searchParams)
		
	}

/* ---------- get ----------------------------------------------------------- */
function get(params){
	return this.model.getById(params.id).getData()
}
/* ---------- remove -------------------------------------------------------- */
function remove(params){
	this.model.remove(params.auth_type)
}
/* ---------- save ---------------------------------------------------------- */
function save(params){
	var data = params.getKeys()
		.filter(function (k) {
			if (/\$/.test(k)) return false;
			if ("controller,action,id,method,errors".listContains(k)) return false;
			return true;
		})
		.reduce(function (obj,k) {
			var path = k.replace(/\//g,".");
			//strip whitespace in comma separated lists
			var value = params[k].split(/,/).map(function (i) {
				return i.trim()
			}).join()
			obj.setByPath(path,value)
			return obj
		},{})
	//Myna.printConsole(Myna.dumpText(data));
	
	return Myna.Admin.authtype.save(data)
}

