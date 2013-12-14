/* ---------- init ---------------------------------------------------------- */
	function init(){
		/*this.applyBehavior("ModelSearchList",{
			pageSizeParam:"limit",
			defaultSort:[{
				property:"appname",
				direction:"asc"
			},{
				property:"name",
				direction:"asc"
			}]
		})*/
	}
/* ---------- list ---------------------------------------------------------- */
	function list(params){
		if (!params.sort){
			params.sort=[{
				property:"appname",
				direction:"asc"
			}]
			
		}
		
		var $this = this;
		var criteria = params.filter(function(v,k){
			if ( $this.model.columnNames.contains(k) && v){
				return true;
			}
		}).map(function(v,k){
			return "%" +String(v).toLowerCase()+"%"
		})
		
		criteria.orderBy =params.sort.map(function(def){
			return def.property + " " + def.direction
		}).join()
		
		var meta = {
			page:params.page,
			pageSize:params.limit
		}
		var beans=this.model.findBeans(criteria,meta)

		return {
			data:beans,
			totalRows:beans.totalRows
		} 
		
	}
/* ---------- getUsers ---------------------------------------------------------- */
	function getUsers(params){
		if (!params.sort){
			params.sort=[{
				property:"appname",
				direction:"asc"
			}]
			
		}
		
		var ug = this.model.getById(params.user_group_id)
		var $this = this;
		var criteria = params.filter(function(v,k){
			if ( $this.model.columnNames.contains(k) && v){
				return true;
			}
		}).map(function(v,k){
			return "%" +String(v).toLowerCase()+"%"
		})
		
		criteria.orderBy =params.sort.map(function(def){
			return def.property + " " + def.direction
		}).join()
		
		var meta = {
			page:params.page,
			pageSize:params.limit
		}
		//var beans=ug.Users(criteria,meta)
		var beans=ug.Users()

		return {
			data:beans,
			totalRows:beans.totalRows
		} 
	}
/* ---------- save ---------------------------------------------------------- */
	function save(params){
		var bean = this.model.get(params);
		var result = bean.save()
		result.data = bean.data
		return result
	}


