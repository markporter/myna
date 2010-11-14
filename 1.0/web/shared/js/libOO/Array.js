/* Class: Array 
	Additional functions on the JS Array object    
	
	 
*/ 
if (!Array.prototype.every)
{
/* Function: every
	Tests whether all elements in the array pass the test implemented by the provided function.
	
	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/every
*/
  Array.prototype.every = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this &&
          !fun.call(thisp, this[i], i, this))
        return false;
    }

    return true;
  };
}

if (!Array.prototype.filter)
{
/* Function: filter
	Creates a new array with all elements that pass the test implemented by the provided function.
	
	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/filter
*/
Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

if (!Array.prototype.forEach)
{
/* Function: forEach
	Executes a provided function once per array element.

	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/forEach
*/
Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };
}

if (!Array.prototype.indexOf)
{
/* Function: indexOf
	Returns the first index at which a given element can be found in the array, or -1 if it is not present.

	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/indexOf
*/
Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

if (!Array.prototype.lastIndexOf)
{
/* Function: lastIndexOf
	Returns the last index at which a given element can be found in the array, or -1 if it is not present.

	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/lastIndexOf
*/
Array.prototype.lastIndexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]);
    if (isNaN(from))
    {
      from = len - 1;
    }
    else
    {
      from = (from < 0)
           ? Math.ceil(from)
           : Math.floor(from);
      if (from < 0)
        from += len;
      else if (from >= len)
        from = len - 1;
    }

    for (; from > -1; from--)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

if (!Array.prototype.map)
{
/* Function: map
	Creates a new array with the results of calling a provided function on every element in this array.

	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/map
*/
Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

if (!Array.dim)
{
/* Function: dim
	returns an array of size _count_ containing null objects
	
	Parameters:
		count		-	number of integers in returned array
		
	
	Example:
	(code)
		var strings = Array.dim(5).map(function(element,index){
			return "String " + index++; 
		})
	(end)
*/
  Array.dim = function(count)
  {
	  var result=[]
	  for (var x = 0; x < count; ++x){
			 result.push(null);
	  }
	  return result
  };
}



/* Function: reduce
	Apply a function simultaneously against two values of the array (from left-to-right) as to reduce it to a single value.
	
	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/reduce
		
*/
if (!Array.prototype.reduce)
{
/* Function: reduce
	Apply a function simultaneously against two values of the array (from left-to-right) as to reduce it to a single value.
	
	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/reduce
*/
Array.prototype.reduce = function(fun /*, initial*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var i = 0;
    if (arguments.length >= 2)
    {
      var rv = arguments[1];
    }
    else
    {
      do
      {
        if (i in this)
        {
          rv = this[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len)
          throw new TypeError();
      }
      while (true);
    }

    for (; i < len; i++)
    {
      if (i in this)
        rv = fun.call(null, rv, this[i], i, this);
    }

    return rv;
  };
}

if (!Array.prototype.reduceRight)
{
/* Function: reduceRight
	Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value.
	
	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/reduceRight
*/
Array.prototype.reduceRight = function(fun /*, initial*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    // no value to return if no initial value, empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var i = len - 1;
    if (arguments.length >= 2)
    {
      var rv = arguments[1];
    }
    else
    {
      do
      {
        if (i in this)
        {
          rv = this[i--];
          break;
        }

        // if array contains no values, no initial value to return
        if (--i < 0)
          throw new TypeError();
      }
      while (true);
    }

    for (; i >= 0; i--)
    {
      if (i in this)
        rv = fun.call(null, rv, this[i], i, this);
    }

    return rv;
  };
}

if (!Array.prototype.some)
{
/* Function: some
	Tests whether some element in the array passes the test implemented by the provided function.
	
	See:
		https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/some
*/
Array.prototype.some = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this &&
          fun.call(thisp, this[i], i, this))
        return true;
    }

    return false;
  };
}

/* Function: min
	returns the "smallest" member of the array.
	
	Parameters:
		compare	-	*Optional, default: function(a,b){return a < b}*
						A compare function like sort() uses to determine the minimum
						value
	
*/
Array.prototype.min = function(compare) {
	if (!compare) compare = function(a,b){return a < b}
	return this.reduce(function(result,e){
		if (result === null ||compare(e,result)) {
			return e;
		} else return result;
	},null);
}

/* Function: max
	returns the "largest" member of the array.
	
	Parameters:
		compare	-	*Optional, default: function(a,b){return a > b}*
						A compare function like sort() uses to determaxe the maximum
						value
	
*/
Array.prototype.max = function(compare) {
	if (!compare) compare = function(a,b){return a > b}
	return this.reduce(function(result,e){
		if (result === null ||compare(e,result)) {
			return e;
		} else return result;
	},null);
}

/* Function: sum
	returns a sum of the array.
	
	Parameters:
		accessor	-	*Optional, default: function(element){return element}*
						A function that takes an element of the array and returns a
						value to be summed. This is useful to force integer math or 
						to sum a property of the objects in the array rather than
						the objects themselves.
	
*/
Array.prototype.sum = function(accessor) {
	if (!accessor) accessor = function(element){return element}
	return this.reduce(function(result,e){
		return result + accessor(e);
	},0);
}

/* Function: avg
	returns an average of the array.
	
	Parameters:
		accessor	-	*Optional, default: function(element){return element}*
						A function that takes an element of the array and returns a
						value to be averaged. This is useful to force integer math 
						or to average a property of the objects in the array rather 
						than the objects themselves.
	Note: 
		null values are ignored. If you want to count nulls as 0, use this 
		_accessor_
		
		(code)
			function(element){
				return element===null?0:element;
			}
		(end)
*/
Array.prototype.avg = function(accessor) {
	if (!accessor) accessor = function(element){return element}
	return this.filter(function(e){
		return accessor(e) !== null;
	}).reduce(function(result,e,index,array){
		if (index < array.length -1){
			return result + accessor(e);
		} else {
			result += accessor(e);
			return result / array.length;
		}
	},0);
}


/* Function: parse 
	Static function that returns an array from an array like object, or null if 
	conversion is not possible
	
	Parameters:
		obj						-	object to convert
		accessFunction		-	*Optional, default function(obj,index){return obj[index]}*
									function that takes _obj_ and an index and returns 
									the item at that index
		lengthFunction		-	*Optional, default function(obj){return obj.length}*
									function that takes _obj_ and returns the length of 
									the collection
		
	Detail:
		Takes an array-like object and returns an array containing its items.
	
	Example:
	(code)
	//convert function arguments into an array of arguments
	function echoArgs(){
		Myna.printDump(Array.parse(arguments))
	}
	
	// client side example:
	// getElementsByTagName() returns an array-like collection, but it doesn't 
	// have any of the Array extras like "filter"
	debug_window(
		Array.parse(document.getElementsByTagName("div"))
		.filter(function(div){
			return /panel/.test(div.className);
		})
	)
	(end)
*/
Array.parse = function ParseArray(obj,accessFunction,lengthFunction){
	if (!accessFunction) accessFunction = function(obj,index){return obj[index]}
	if (!lengthFunction) lengthFunction = function(obj){return obj.length}
	
	var result =[];
	for (var x=0; x < lengthFunction(obj); ++x){
		result.push(accessFunction(obj,x));	
	}
	return result;
}

/* Function: compact 
	removes undefined values from an array
	
	Detail:
		Modifies an array in place by removing values and renumbering the indexes
	
	Example:
	(code)
		//create an array with 50 null values
		var a=Array.dim(50);
		// now delete half of them
		Array.dim(25).forEach(function(d,i){
			delete a[i];
		})
		Myna.println(a.length);//prints 50
		//now compact
		a.compact();
		Myna.println(a.length);//prints 25
	(end)
*/
Array.prototype.compact = function compactArray(){
	var a =this;
	for (var i = a.length-1;i >=0;--i){
		if (a[i] === undefined) a.splice(i,1);
	}
}

/* Function: contains 
	searches an array and returns true if one or more are found
	
	Parameters:
		search	-	a simple value or a function to identify a matching entry. If 
						this is function, it will be called with a the current array 
						item and should return *true* if this is a matching item
	
	Note:
		unlike <indexOf> This function does a loose comparison. This means that 
		if, for instance you search for *false*, you will match entries with values
		of null, undefined, "",0,etc
		
	Examples:
	(code)
		//does the array contain "woot" ?
		return someArray.contains("woot");
		
		//does the array contain an entry that contains "woot" ?
		return someArray.contains(function(entry){
			return /woot/.test(entry)
		});
		
		//does the array contain "woot" and "dude"?
		return ["woot","dude"].every(someArray.contains)
		
		//does the array contain an entry that contains "woot" OR "dude"?
		return ["woot","dude"].some(function(term){
			return someArray.contains(function(entry){
				return new RegExp(term).test(entry);
			})
		})
		
	(end)
*/
Array.prototype.contains = function contains(search){
	for (var x=0; x<this.length;++x){
		if (typeof search === "function"){
			if (search(this[x])) return true;	
		} else {
			if (this[x] == search) return true	
		}
	}
	return false;
}

if ("$server_gateway" in this){
	(function(){
		var hide = function (o, p) {
		 java.lang.Class.forName ("org.mozilla.javascript.ScriptableObject")
			.getMethod("setAttributes", java.lang.String, java.lang.Integer.TYPE)
			.invoke(o, p, new java.lang.Integer( 
				org.mozilla.javascript.ScriptableObject.DONTENUM
			)
		 );
		}
		
		for (var p in Array.prototype) hide(Array.prototype, p)
		delete p;
		delete hide;
	})()
}