# Contents #


# Background #
The aim of the project is to build and release a library of runtime type contracts in Javascript. The goal is to build a lightweight library in plain, unmodified Javscript in order to provide Javascript developers with a form of basic type safety, allowing for more structured code.

Closure and Contracts.Coffee are similar but are more heavyweight approaches. This is a lightweight approach in completely unmodified Javascript.

# Implementation #
## Basics ##
Contracts are specified by calling contract factory methods, then providing the resulting function with a label. for example, to create a contract that enforces an object to be a function from Integers to Integers:
```
var contract = FunctionContractFactory(IntegerContractFactory(), IntegerContractFactory())(label);
```

We use the T function as a convenient way of doing this. The T function requires a spec as a string and an object in which to bind the contract with. For example,
```
var incrementR = T(“increment :: Int -> Int”, function (a) { return ++a; });
```
would assign a type safe version of the increment function. The contract is specified by giving a name to the contract followed by “::” and then the contract of the function. In this case, the function takes in an Integer and returns an Integer. Typically, the name of the variable containing the object is used as the label.

## Components ##
### Contracts ###
#### Mechanism by which they work ####
Contracts have a number of generic properties inherited from the Contract object. They each have two main, important functions: relax and restrict. These relax and restrict mechanisms allow us to mix unsafe and safe code, where safe code is everything that has been defined using a contract. In general, we want to ensure the types of the input and output conform to the specified contract. As the body of a function is considered unsafe, inputs are relaxed, the body of the function is executed and the output is brought back to type safe land via the restrict function.

Both the restricting and relaxing perform a type-check and any necessary conversions between safe and unsafe types. Should an object not conform to the specified contract at the time of a relax or restrict, a type error will be thrown. For example, object types are wrapped away on a restrict and unwrapped on a relax, both performing type checks as this occurs.

It is not uncommon for something to be restricted and relaxed multiple times.

Each contract also has a corresponding Factory function which allows the Contract to only be generated when the ‘label’ (eg. “increment”) and potentially other arguments have been specified.

#### Types of contracts ####
  * **IntegerContract** - “Int” - only allows Integer values. As Javascript does not have an Integer type, we first use typeof() to check the value is of type Number and then round it to check it is indeed an integer.
  * **NumberContract** - “Num” - allows non-integer number values. Uses typeof() to check if the type is a number.
  * **StringContract** - “String” - allows string values. Uses typeof() to check if the type is a string.
  * **BooleanContract** - “Bool” - allows boolean values. Uses typeof() to check if the type is a boolean.
  * **UnitContract** - “Unit” - allows for undefined. Uses typeof() to check if the type is undefined. The only acceptable value is undefined, null does pass this contract.
  * **ListContract** - “`[ … `]” - allows for lists of values. The list contract requires an item contract. Eg. [Int](Int.md) or polymorphic types such as [a](a.md) (See VariableContract).
  * **MapContract** - `<Int`> - allows for a Javascript map from a String to another contract. The MapContract requires a key contract and a value contract. Currently, the key contract is always a StringContract as Javascript treats all map keys as Strings, so keys not of type String are not supported.
  * **ForAllContract** - “forall a b.” - allows for type variables to be created. Variables are locked away using a key so they cannot be accessed. When a function returns it unwraps the value back out.
  * **VariableContract** - “a” - allows for type variables to be used.
  * **FunctionContract** - “->” - recursively relaxes inputs and restricts output. Also recursively applies the arguments one at a time which enables currying to be used. A function with multiple parameters is simply treated as a function with one input which returns another function and so on.
  * **ObjectContract** - “{fieldName: fieldType} @ ObjectName” - allows for custom objects. Requires a set of fields which contain the individual field contracts within. In the restrict function, the object is wrapped away and access to fields are via getters/setters which enforce the type information given. The relax function unwraps the function and returns it to its original state. The “@” is optional and adds an additional check to check the constructor of the object matches the specified object.
  * **MaybeContract** - “?” - allows for null/undefined values. This contract takes in another contract and wraps it up. Firstly it checks if the value is null or undefined, if not, it simply passes it on to original contract. For example “String?” will allow all String values as well as null and undefined.
  * **EmptyContract** - “0” - an empty contract. This allows for functions to have no arguments.
  * **ADTContract** - - allows for algebraic data types to be specified. The contract requires an adt name and the corresponding contracts associated with each data constructor. It checks that the ADT is valid and matches the contract, before applying the additional contract provided by the data constructors. (See Algebraic data types to see how ADTs are specified and created).

### Parser ###
The parser’s task is to generate the contracts specified in the String that was given. It takes something like
```
lookup :: forall b. String -> <b> -> b?
```
into a series of contracts. The T function splits the name away from the rest of the spec. It then passes the spec onto the buildContract() function, which splits the input into an array. It then recursively parses the spec and generates the contract (made up of other contracts) in this fashion.

### Other features ###
#### Currying ####
Currying is implemented in the FunctionContract, which has a recursive definition allowing arguments to be applied one at a time without actually executing the function directly until all arguments are supplied. For example the following code is valid:
```
var convertR = T(“convert :: Number -> Number -> Number”, function (ratio, value) { return value*ratio; });
var inchToCm = convertR(2.2);
inchToCm(5); // Returns the same thing as convertR(2.2, 5);
```

#### Typedefs ####
Typedefs allow for complicated objects to be renamed and used in contracts as a custom type. For example,
```
T(“typedef Person :: {name: String, age: Int}”);
```
We can now use this in a contract like
```
T(“getAge :: Person -> Int”, function () { … });
```

The way typedefs are implemented is quite simple. Each time the typedef keyword is used, it creates simply stores the spec as a String associated with the key. Using predefined keywords like “Int” is disallowed. This allows typedefs to be declared in any order before being used.

A typedef can be created directly using the createTypedef function, which takes in the keyword and spec and stores it for use later.

When a contract is given, it is parsed to check if any typedefs are present in the spec. If so, it simply expands the contract by replacing the typedef with the stored spec. It continues to do this recursively, allowing typedefs to contain other typedefs, until there are no more typedefs.

#### Merge operator ####
The merge operator allows for different object record contracts to be combined. For example,
```
T(“typedef Child :: {school: String} U Person”);
```
This will create a standard record contract which contains the school, name and age fields.

A function ObjectContractFactoryMerge(a, b) merges two `ObjectContractFactory`s.

#### Algebraic data types ####
D is used to specify algebraic data types (ADT). For example,
```
var BTree = D(“BTree = Empty | Leaf Int as value | Node BTree as left BTree”);
```
D function works in a similar fashion to the T function. It parses the ADT spec, first of all creating the contract by first creating a contract for each of the data constructors (eg. Empty, Leaf, Node contracts). After this, the ADTContract is created with these contracts and is stored in a table with the ADT name used as a key (eg. BTree). It then creates the constructor functions with the appropriate contracts attached. (eg. allows a Node to be created).

## Testing ##
### Unit tests ###
The unit tests currently use QUnit, a JQuery testing framework.
To run the tests, simply open qunit.html and the tests will run in the browser.

The tests are written in modules, which are a set of tests. Each module has a series of “tests” which test different aspects of the program. Within each Test function there are a series of tests which are related.

### Code coverage ###
JSCoverage is currently used to check for test code coverage. The user manual for JSCoverage manual can be found here - http://siliconforks.com/jscoverage/manual.html. Note that Mac has a bug in JSCoverage with an easy fix here: http://siliconforks.com/jscoverage/bugs/33.

To run, create the instrumented version of the project:
jscoverage SOURCE-DIRECTORY DESTINATION-DIRECTORY

Inside the instrumented directory:
jscoverage-server

Then open a browser and open “localhost:8080/jscoverage.html”. Once open, enter “qunit.html” to execute the tests.

### Performance tests ###
Currently no performance tests.