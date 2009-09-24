
var templates = {
	addColumn:[
		"ALTER TABLE {tableName} ADD COLUMN {columnDef}"
	],
	addConstraint:[
		"ALTER TABLE {tableName} ADD CONSTRAINT {id} {constraint} ({name})"
	],
	addNullConstraint:[
		"ALTER TABLE {tableName} ADD CONSTRAINT {id} CHECK ({name} IS NOT NULL)"
	],
	addForeignKeyConstraint:[
		'<tpl for="references">',
			'ALTER TABLE {parent.tableName} ADD CONSTRAINT {parent.id} FOREIGN KEY ({parent.name}) REFERENCES {table}({column})',
			'<tpl if="onUpdate.length"> ON UPDATE {onUpdate} </tpl>',
			'<tpl if="onDelete.length"> ON DELETE {onDelete} </tpl>',
		'</tpl>',
	],
	dropConstraint:[
		'ALTER TABLE {tableName} DROP CONSTRAINT {id}'
	],
	dropPrimaryKey:[
		'ALTER TABLE {tableName} DROP CONSTRAINT {id}'
	],
	dropColumn:[
		"ALTER TABLE {tableName} DROP COLUMN {name}"
	],
	createTable:[
		'CREATE TABLE {tableName} ( \n',
		'<tpl for="columns">',
			'\t{.}{[ xindex == xcount?"":", " ]}\n',
		'</tpl>',
		')'
	],
	createColumn:[
		'{name} ',
		'{type} ',
		'<tpl if="defaultValue && defaultValue.length"> DEFAULT {defaultValue} </tpl> ',
		'{constraints} '
	],
	createIndex:[
		'CREATE <tpl if="unique.length"> UNIQUE </tpl>  INDEX {id} ',
		'ON {tableName} ({columns})'
	],
	dropTable:[
		'DROP TABLE {tableName}'
	],
	notNullConstraint:[
		'NOT NULL'
	],
	uniqueConstraint:[
		'UNIQUE'
	],
	primaryKeyConstraint:[
		'PRIMARY KEY'
	],
	referencesConstraint:[
		'<tpl for="references">',
			'REFERENCES {table}({column})',
			'<tpl if="onUpdate.length"> ON UPDATE {onUpdate} </tpl>',
			'<tpl if="onDelete.length"> ON DELETE {onDelete} </tpl>',
		'</tpl>',
	],
	
}
var types={
	BIGINT:"INT8",
	BLOB:"BYTEA",
	CLOB:"TEXT",
	DATE:"DATE",
	INTEGER:"INT",
	TEXT:"TEXT", //this type should be whatever is best for large amounts 
				//of text that can fit in server memory
	NUMERIC:'NUMERIC({maxLength}<tpl if="decimalDigits.length">, {decimalDigits}</tpl>)',
	TIMESTAMP:"TIMESTAMP",
	VARBINARY:"BYTEA",
	VARCHAR:"VARCHAR({maxLength})"
}

var dsInfo={
	driver:"org.postgresql.Driver",
	url:"jdbc:postgresql://{server}:{port}/{db}"
}
var connectionTestSql="select 1";
var functions={
	getDefaultSchema:function(db){
		var schemas = db.schemas;
		var defaultSchema="public";
		for (var x =0; x < schemas.length; ++x){
			if (schemas[x] == ""){
				defaultSchema = "";
				break;

			}
		}
		return defaultSchema;
	},
	
	getSchemas:function(db){
		return new Myna.Query({
			ds:db.ds,
			sql:<ejs>
				select t.table_schema as owner, count('x')
				from INFORMATION_SCHEMA.TABLES t
				
				group by t.table_schema
				having count('x') > 0
			</ejs>
		}).valueArray("owner")
		
	}, 
	/* getSchemas:function(db){
		var rsSchemas = db.md.getSchemas();
		var schemas = new Myna.Query(rsSchemas).valueArray("table_schem");
		schemas.push("");
		rsSchemas.close();
		return schemas;
	}, */
	getTables:function(db, schema){
		/* return new Myna.Query({
			ds:db.ds,
			sql:<ejs>
				select 
					table_catalog as table_cat,
					table_schema as table_schem,
					table_name,
					table_type, 
					null as remarks,
					user_defined_type_catalog as type_cat,
					user_defined_type_schema as type_schem,
					user_defined_type_name as type_name,
					self_referencing_column_name as self_referencing_col_name, 
					reference_generation as ref_generation 
				from INFORMATION_SCHEMA.tables
				where
					and schema = {schema}
		
			</ejs>,
			values:{
				cat:db.catalog,
				schema:schema.toUpperCase()
			}
		}).data */
	 	var rsTables = db.md.getTables(
			db.catalog,
			schema,
			'%',
			null
		); 
		var data =new Myna.Query(rsTables).data;
		rsTables.close();
		return data 
	},
	setClob:function(con,st,index,value){
		st.setObject(index+1,value,java.sql.Types.VARCHAR);
		/* var reader =new java.io.StringReader(value);
		st.setCharacterStream(index,reader,value.length) */
	}
}