# Contents #


# What is Ristretto #
Ristretto is a lightweight Javascript library which implements run-time type contracts in pure, unmodified Javascript. It allows Javascript developers to ensure type safety, allowing for better documented and structured code. As a Javascript library, no compilation is required and the library can be used as little or as much as you choose.

# Getting started #
## Downloading ##
The library can be downloaded via the Downloads link above.

## Including the library ##
To include the library, simply add this to any HTML file in which you want to use this library:
```
<script type="text/javascript" src="ristretto.min.js"></script>
```

You should also include this where ever you use the library to ease use of the library:
```
<script type="text/javascript">
    var T = Contract.T;
</script>
```

If developing with node.js add the following to the top of your code:
```
if (require) {
    var Contract = require("./ristretto");
    var T = Contract.T;
}
```
## Ready! ##
You're now ready to start using the library! Continue writing, running, testing Javascript as you always have whilst using the library.

# Using the library #
It's not necessary to convert all your code - all your code will still work, just without the benefits of this library.
## Basic types ##
The following basic types are supported:
  * Int
  * Num
  * String
  * Bool

To use these, we simply annotate functions or objects.

**Example**
Here is a simple example of using a type contract with a function:
```
var add = T("add :: Int -> Int -> Int",
function (a, b) {
    return a + b;
});
```
This results in the following behavior:
```
add(4, 5.0); // 9
add(4, "5"); // TypeError is thrown
add(false, 5); // TypeError is thrown
add(4.5, 5.5); // TypeError is thrown
```

## Unit function ##
The Unit function allows for functions without return values to be specified.

**Example** Here is an example function you might have that uses this:
```
var x;
var setValue = T("setValue :: Int -> Unit",
function (val) {
    x = val;
});
```
This results in the following behavior:
```
setValue(5); // x = 5
setValue("string"); // TypeError is thrown
```
_Note: This simply checks that the return value is undefined_

## Functions ##
At times, functions will often be passed around or returned. They can be explicitly defined using parentheses.

**Example** An example where a function is passed around.
```
var add = T("add :: Int -> Int -> Int",
function (a, b) {
    return a + b;
});
var double = T("apply :: Int -> (Int -> Int -> Int) -> Int",
function (a, fn) {
    return fn(a, a);
});
```
This results in the following behavior:
```
double(5, add); // 10
double("string", add); // TypeError is thrown
double(5, function (a, b) { return "String"; }); // TypeError is thrown
```
## Empty function ##
Functions with no parameters can also be specified using the '0' (zero) notation.

**Example** Here is an simple example of a function with no parameters being used:
```
var getSize = T("getSize :: 0 -> Int",
function () {
    return 5000;
});
```
This results in the following:
```
getSize(); // 5000
getSize(5000); // TypeError is thrown
```

Implicit bracketing is also supported. This is a more complicated example to show the behavior of this contract:
```
var health = 90;

function getHealth() {
    return health;
}

function setHealth(h) {
    health = h;
    return getHealth;
}

function getSetHealth() {
    return function () { return setHealth; };
}

var getSetHealthR = T("getSetHealth :: 0 -> (0 -> (Int -> (0 -> Int)))", getSetHealth);
var getSetHealthR2 = T("getSetHealth :: 0 -> 0 -> Int -> 0 -> Int", getSetHealth);
```
Both contracts yield the same result:
```
getSetHealthR()()(70)(); // 70
getSetHealthR2()()(70)(); // 70
```

## Objects ##
Objects can be specified with fields matching particular type contracts. Definitions are recursive, so fields can have any type contract, including another object. These contracts check for the specified fields at a _minimum_. If the object contains any additional fields they are simply ignored in all type checks. This means that it is not possible to check for an empty object, but you can check for an object.

**Example** Object type contracts are defined as below:
```
var createPerson = T("createPerson :: Int -> {age: Int, name: String}",
function (age) {
    return {age: age, name: "newName"};
});
var itsMyBirthday  = T("itsMyBirthday :: {age: Int, name: String} -> Int",
function (person) {
    person.age++;
    return person.age;
});
```
This results in the following:
```
itsMyBirthday(createPerson(5)); // 6
itsMyBirthday({age: 6, name: "Sam", gender: "Male"}); // 7
itsMyBirthday({age: "6", name: "Sam"}); // TypeError is thrown
itsMyBirthday({age: 6}); //TypeError is thrown
```

### Checking the constructor ###
Using the @ symbol adds an additional check for the constructor.

**Example** Using a constructor named Person:
```
function Person () {
    this.age = 0;
    this.name = "new name";
}

var itsMyBirthday  = T("itsMyBirthday :: {age: Int, name: String}  @ Person -> Int",
function (person) {
    person.age++;
    return person.age;
});
```
This results in the following:
```
itsMyBirthday(new Person()); // 1
itsMyBirthday({age: 5, name: "Sam"}); // TypeError is thrown
```

### Merge operations ###
Merge operations use the 'U' (capital letter 'U') to merge two object records. This merge operator can only be used with objects. It can be used multiple times in a row.

**Example** See [#Typedefs](#Typedefs.md) for an example.

## Typedefs ##
Typedefs are also supported, allowing for objects to be defined and reused with a single name. Definitions are recursive, allowing for typedefs to contain other typedefs. The ordering of typedefs is not important.



**Example** This example carries on from the previous example in Objects, where it was somewhat complicated to continue redefining a Person.
```
T("typedef Person :: {age: Int, name: String}");
T("typedef Male :: Person U {gender: String}");

var getAgeR = T("getAgeR :: Person -> Int",
function (person) {
    return person.age;
});

var getAgeR2 = T("getAgeR2 :: Male -> Int",
function (person) {
    return person.age;
});
```
This results in the following behavior:
```
getAgeR({age: 15, name: "Joe", gender: "M"}); // 15
getAgeR({age: "fifteen", name: "Joe"}); // TypeError is thrown

getAgeR2({age: 15, name: "Joe", gender: "M"}); // 15
getAgeR2({age: 15, name: "Joe"}); // TypeError is thrown
```

## Type variables ##
Type variables are supported in Ristretto. The forall construct allows for type variables to be defined and used. When type variables are being used, they cannot be accessed or manipulated directly since the function does not know anything about the type.

**Example** A simple case in which type variables are used:
```
var id = T("id :: forall a. a -> a", 
function (input) { 
    return input;
});

var badId = T("badId :: forall a. a -> a", 
function (input) { 
    return input + "4";
});
```
This results in the following:
```
id(4); // 4
id("some string"); // "some string"

badId(4); // TypeError is thrown
badId("some string") // TypeError is thrown
```

## Lists and Maps ##
Lists, arrays and maps are also supported. Lists/arrays are defined using the `'[]'` syntax.

As a simple example an array of Ints can be defined as
```
[Int]
```

Type variables can also be used.

**Example** A map function which transforms a list to another list. Two other incorrect map functions are shown.
```
var map = T("map :: forall a b. [a] -> (a -> b) -> [b]", 
function(a, b) { 
    return Array.prototype.map.call(a, function(x, y, z) { return b(x); }); 
});

var badMap = T("badMap :: forall a b. [a] -> (a -> b) -> [b]", 
function (list, f) {
    list[0] = f(list[0]);
    return list;
});

var sneakyMap = T("badMap :: forall a b. [a] -> (a -> b) -> [b]",
function (list, f) {
    var out = map(list, f);
    out[0]++;
    return out;
});

function increment(a) {
    return a + 1;
}

```

This results in the following:
```
map([1,2,3], increment); // [2,3,4]
map([1,2, "string"], increment); // TypeError is thrown
badMap([1,2,3], increment); // TypeError is thrown
sneakyMap([1,2,3], increment); // TypeError is thrown
```

## Dictionaries ##
Dictionaries can also be defined. Note in Javascript, dictionaries are simply object properties, meaning all keys are treated as strings. As a result, the key type always defaults to String and cannot be changed as a limitation of Javascript.

**Example** A simple dictionary being used.
```
var lookup = T("lookup :: forall b . <b> -> String -> b",
function (dict, key) {
    return dict[key];
});
```
This results in the following:
```
lookup({3: "foo"}, "3"); // "foo"
lookup({3: 4}, "3"); // 4
lookup({3: "foo"}, "foo"); // TypeError is thrown
lookup({3: 4, 5: "food"}, "3"); // TypeError is thrown
```

## Maybe type ##
The maybe type can be combined with any other contract and allows for null or undefined values.

**Example** A good example of a case when you might need to use the maybe type is with dictionaries, where if the key does not exist in the dictionary, _undefined_ is returned.

**Example** A simple example of the maybe type being used.
```
var apply = T("apply :: (Int -> Int)? -> Int -> Int?",
function (fn, arg) {
    return fn != null ? fn(arg) : null;
});
```
The result of this is the following:
```
apply(function increment (num) { return ++num; }, 9) // 10
apply(null, 9); // null
apply(undefined, 9); // null
```

## More advanced features ##
More advanced features such as currying of functions and algebraic data types can be found on the AdvancedFeatures page.