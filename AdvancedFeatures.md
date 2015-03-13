

# Advanced Features #
This pages demonstrates additional features in Ristretto.

## Currying of functions ##
Currying of functions is supported in Ristretto. This allows for the partial application of parameters.

**Example** A simple example of currying and why it might be useful:
```
var convert = T("convert :: Num -> Num -> Num", 
function (ratio, value) {
	return ratio*value;
});

var inchToCm = convert(2.2);
```
This results exactly as you would expect:
```
convert(2.2, 5); // 11
inchToCm(5); // 11
inchToCm("string"); // TypeError is thrown
```
## Algebraic data types ##
Algebraic data types (ADTs) can be defined in Ristretto using the D function. A _name_ must be given to the ADT and a series of data constructors must be supplied. The data constructors are each given a name and then a series of contracts for their parameters. The "as" operator can be used to give a label to that value, used for data access.

**Example** A BTree is created using an ADT.
```
var BTree = D("BTree = Empty | Leaf Int as value | Node BTree as left BTree");
```

Three data constructors are given, the Empty, Leaf and Node constructors. Empty has no parameters, Leaf has one Int parameter named value, Node has two BTree parameters, one named left.

### Instantiation ###
An ADT can then be instantiated using the provided constructors.

**Example** Several different BTrees being created:
```
BTree.Empty();
BTree.Leaf(4);
BTree.Node(BTree.Node(BTree.Empty(), BTree.Leaf(4)), BTree.Leaf(5));
```

Type contracts are generated around all data constructors, resulting in the following:
```
BTree.Leaf("5"); // TypeError is thrown
BTree.Node(BTree.Empty(), 6); // TypeError is thrown
```

### Constructor information ###
Several functions are provided to ADTs to allow for easy checking of what data constructor was used.

**Example** Several methods for BTrees exist
```
var tree = BTree.Empty();
tree.isEmpty(); // true
tree.isLeaf(); // false
tree.isNode(); // false
```

### Data access ###
Data access is provided for all values. Values are given default names of numbers (0, 1, 2, ...) based on their position; unless names are defined using 'as'.

**Example** A BTree being defined and being used:
```
var BTree = D("BTree = Empty | Leaf Int as value | Node BTree as left BTree");

var leftValue = T("leftValue :: BTree -> BTree?",
function (tree) {
    if (tree.isNode()) {
        return tree.left;
    }
});
```

### Pattern matching ###
ADTs support pattern matching. The ADT object contains a matcher function which creates a new matcher, or returns a cached version.

#### Matcher function ####
The original ADT object has a matcher function which will return you a matcher. However, caching is supported based on the parameters passed in.

**Example** BTree's matcher function
```
BTree.matcher(); // Creates a new matcher function
BTree.matcher(fn); // On the first call, it creates and caches the matcher 
                   // function against the fn function under a default property 
                   // name. On subsequent calls, it returns the cached matcher.
BTree.matcher(fn, "m"); // On the first call, it creates and caches the matcher 
                        // function against the fn function under the "m" property 
                        // name. On subsequent calls, it returns the cached matcher.
```

#### Defining patterns ####
A matcher contains functions for each data constructor, allowing that data constructor to be used as a base pattern. It also contains the default function `"_"`.

These pattern functions are recursive and must be called with either specific values that need to be matched or variables which will be assigned to that value. If variables are provided, the values are assigned to that property name, allowing it to be used within callbacks. The default variable `"_"` results in no assignments.

If a literal string value is provided to be matched against, it must be prefixed with the character `'` (single quote).

#### Executing the matcher ####
To execute the matcher, simply call the matcher function with an object. This will execute each pattern in the order they were defined until a match is found, at which the callback will be called. If none of the patterns are matched, undefined is returned. Once a pattern is matched, no more pattern matching is performed, even if more patterns would match.

**Example** An example depth function written using pattern matching against an ADT:
```
var BTree = D("BTree = Empty | Leaf Int| Node BTree BTree");

function depth (tree) {
    var m = BTree.matcher(depth, "m");
    m.Empty()(function () { return 0; });
    m.Leaf("_")(function () { return 1; });
    m.Node("a", "b")(function() { return Math.max(depth(m.a), depth(m.b)) + 1; });
    return m(tree);
}
```
This results in the following:
```
depth(BTree.Leaf(4)); // 1
depth(BTree.Node(BTree.Leaf(4), BTree.Leaf(5))); // 2
```

**Example** A more complex example to demonstrate recursive pattern matching:
```
var BTree = D("BTree = Leaf Int| Node BTree BTree");

function diffDepth (tree) {
    var m = BTree.matcher();
    m.Node(m.Node(m.Leaf(5), "a"), m.Node("b", "_"))
        (function () { return Math.max(diffDepth(m.a), diffDepth(m.b)) + 100; } );
    m.Leaf("_")(function () { return 1; });
    m.Node("a", "b")(function() { return Math.max(diffDepth(m.a), diffDepth(m.b)) + 1; });
    return m(tree);
}
```
This results in the following:
```
diffDepth(
            BTree.Node(
                BTree.Node(
                    BTree.Leaf(5),
                    BTree.Leaf(4)),
                BTree.Node(
                    BTree.Leaf(3),
                    BTree.Leaf(2)))
            ); // 101
diffDepth(
            BTree.Node(
                BTree.Node(
                    BTree.Leaf(100),
                    BTree.Leaf(4)),
                BTree.Node(
                    BTree.Leaf(3),
                    BTree.Leaf(2)))
            ); // 3
diffDepth(
            BTree.Node(
                BTree.Node(
                    BTree.Leaf(5),
                    BTree.Node(
                        BTree.Leaf(6),
                        BTree.Leaf(7))),
                BTree.Node(
                    BTree.Leaf(3),
                    BTree.Leaf(2)))
            ); // 102
```