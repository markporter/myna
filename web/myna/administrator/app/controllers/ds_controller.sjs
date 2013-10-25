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
	return [this.model.getById(params.id).getData()]
}
/* ---------- remove -------------------------------------------------------- */
function remove(params){
	this.model.remove(params.name)
}
/* ---------- save ---------------------------------------------------------- */
function save(params){
	var ds = this.model.get(params)
	var ret= ds.save()
	ret.merge(Myna.Admin.ds.test(ds.name))
	return ret
}

