var imported_groups = new Myna.Query({
	ds:"myna_permissions",
	sql:"select * from user_groups where auth_type is not null"
}).data.toMap("auth_type","name",true);

imported_groups.forEach(function(groups,auth_type){
	if (!auth_type || auth_type =="undefined") return
	var adapter = Myna.Permissions.getAuthAdapter(auth_type);
	groups.forEach(function (group) {
		adapter.importGroup(group)
	})

})

