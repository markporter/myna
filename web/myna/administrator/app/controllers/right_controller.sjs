/* ---------- init ---------------------------------------------------------- */
	function init(){
		/*this.applyBehavior("ModelSearchList",{
			searchFields:[
				"first_name",
				"last_name",
				"email",
				"right_id"
			],
			resultFields:[
				//"right_login_id",
				"right_id",
				//"login",
				//"type" 
			],
			pageSizeParam:"limit",
			defaultSort:[{
				property:"last_name",
				direction:"asc"
			},{
				property:"first_name",
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
/* ---------- remove ---------------------------------------------------------- */
	function remove(params){
		try{
			var bean = this.model.remove(params.id);
		} catch (e){
			return new Myna.ValidationResult().addError(String(e));
		}
		
		return new Myna.ValidationResult();
	}
/* ---------- save ---------------------------------------------------------- */
	function save(params){
		var bean = this.model.get(params);
		var result = bean.save()
		result.data = bean.data
		return result
	}


