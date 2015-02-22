var imported_groups = new Myna.Query({
	ds:"myna_permissions",
	sql:"select * from user_groups where auth_type is not null"
}).data.toMap("auth_type","name",true);

//Myna.printConsole(Myna.dumpText(imported_groups));
imported_groups.forEach(function(groups,auth_type){
	var adapter = Myna.Permissions.getAuthAdapter(auth_type);
	groups.forEach(function (group) {
		adapter.importGroup(group)
		//Myna.printConsole("importing {0}:{1}".format(auth_type,group));
	})

})

