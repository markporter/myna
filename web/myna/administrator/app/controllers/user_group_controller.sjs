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
/* ---------- searchByAuthType ---------------------------------------------- */
	function searchByAuthType(params){
		var authType = params.type.replace(/[^\w\.\-]/g,"");
		var adapter = Myna.Permissions.getAuthAdapter(authType)
		try{
			return adapter.searchGroups(params.search.replace(/[^\w\.\-\ '"]/g,""));
		} catch(e){
			return [{title:'<textarea cols="50" rows="25">{0}</textarea>'.format(
				"Error in AuthType connector:\n\n" + String(e)
				)}]
		}
	}
/* ---------- addGroupFromAdapter ---------------------------------------------------------- */
	function addGroupFromAdapter(params){
		params.checkRequired("type","name")
		var authType = params.type.replace(/[^\w\.\-]/g,"");
		var adapter = Myna.Permissions.getAuthAdapter(authType)
		var group =adapter.importGroup(params.name);

		return {
			success:true,
			group:group.data
		}
	}

