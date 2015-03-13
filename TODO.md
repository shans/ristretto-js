

# TODO #

## High-priority ##
  * ~~Fix known issues~~
  * More description and appropriate error messages
    * Have some error reporting pipeline
    * Type failure message for lookup("foo", {3: "foo"}) isn't appropriate.
  * ~~Rename contract.js to ristretto.js~~
  * Improve test coverage

## Other tasks to do ##
  * Measure performance impact
  * ~~Check test coverage (see TestCoverage)~~ 94%
  * to support using within Google: see how easy it is to apply on top of closure obfuscation / minification.

## Additional features ##
  * Optimisations and improve performance
  * Add flags for increased performance
  * Add flags to switch between dev/prod. ie. disable checking but still perhaps enable features like ADTs and currying somehow
  * Dependent types
  * Type families or something similar
  * ADT matching - coverage detection for ADT pattern matchers. ie. is it possible to determine if some cases do not match any at all.
  * ADT - should support infinite ADTs
  * Wrapping constructor for ADTs that takes raw objects and turns them into the full version
  * generating ADTs from JSON or from objects. Also generating typechecked objects from JSON.
  * logging of inputs and outputs could enable you to get type checking and stack traces in prod with a flag toggle
    * (SS) this could create some awesome error tracing
  * inject type checkers into the DOM through jQuery (can replace or extend most of the functions in jQuery).
  * enforce restrictions in DOM structure.
## Food for thought ##
  * Consider using a vararg specification - allow for a variable number of arguments to be specified in the type contracts. Arguments against is that you could write everything without using a variable number of arguments and perhaps that is a better way to code.
  * Optional arguments - closure uses '?' to indicate arguments are optional.
  * Convert from storing strings to storing contract factories for typedefs. Disadvantage is the lack of delayed execution, meaning ordering of typedefs would now be important. If using multiple files this can be annoying and difficult.
    * (SS) there's a good reason to createTypedef with contract objects rather than strings - so people can introduce their own
  * Look into disciple language and the EffectSystem it uses.
  * Monkey testing/automated testing
  * Exploratory types, processObject :: {a: Int, b: Int -> Int} -> Int.
    * CONJECTURE: the value returned from b is returned by procesedObject
    * PROOF: run processObject with a signature of forall x. {a: Int, b: Int -> x} -> x
    * Map type signature is an example of this
  * Harmony proxy
  * Inferring types by parsing javascript - probably not a good idea
  * DOM tree types, event types, etc
  * Can we type-check curried arguments up front, instead of delaying till all arguments are received?
  * forall isn't Haskell-y, consider removing the need for it.
  * Consider making typedefs only work with capitalised names for conventions.
  * Static analysis
  * Monads
  * Undefined and null having the same meaning and could be painful. For: Closure uses '?' for null and '=' for undefined. Against: If people want to use explicit values like null, they can still manually check for it themselves.
  * Typechecking the user-facing parts of the library
  * Mixing with JQuery
  * Generating an object type by walking member function type contracts and prototypes and generating typedefs automatically
  * Confirm whether deep matching is being used by ADTs - could use a flag to switch on and off.
  * Include a type field (string) in objects. Concern about collision of typedef names. Gives the ability to check the type of an object without applying a contract. You can use Object.type instead of "Person".
  * Include coersions to-from Strings. Can verify it is symmetrical. Allows for non-string maps,
  * Syntax is foreign to js developers - maybe provide alternative front-ends?
  * (SS) have we got restrict and relax backwards for objects? Or should both prevent additional modification?
  * (SS) pretty printing for ADTs
  * from a Google pov the jsDoc syntax would be a better fit, though it's not as elegant