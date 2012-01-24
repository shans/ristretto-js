/*
Copyright 2012 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Ristretto

Contains tests for the type contracts written using QUnit. To execute
tests simply open the file in a web browser.

Author: Samuel Li <samli@codesphere.com>, Shane Stephens <shanes@chromium.org>
*/

var T = Contract.T;
var D = Contract.D;

$(document).ready(function() {
    module("Basic types");

    function sum(input) {
        var output = 0;
        for (var i = 0; i < input; i++) {
            output += input;
        }
        return output;
    }

    function noIntOutput(input) {
        return "string" + input;
    }

    test("Int -> Int functions", function() {
        var sumR = T("sum :: Int -> Int", sum)
        var noIntOutputR = T("noIntOutput :: Int -> Int", noIntOutput);

        strictEqual(sum(10), 100, "Valid function");
        strictEqual(sum("10"), "010101010101010101010", "Valid function");

        strictEqual(sumR(10), 100, "Valid function with contract");
        raises(function() { sumR("10"); }, "Valid function with contract");

        strictEqual(noIntOutput(10), "string10", "Invalid function");
        strictEqual(noIntOutput("10"), "string10", "Invalid function");

        raises(function() { noIntOutputR(10); }, "Invalid function with contract");
        raises(function() { noIntOutputR("10"); }, "Invalid function with contract");
    });

    test("Num -> Num functions", function() {
        var sumR = T("sum :: Num -> Num", sum);
        var noIntOutputR = T("noIntOutput :: Num -> Num", noIntOutput);

        strictEqual(sum(10.11), 10.11*11, "Valid function");
        strictEqual(sum("5"), "055555", "Valid function");
        strictEqual(sum(1), 1, "Valid function");

        strictEqual(sumR(10.11), 10.11*11, "Valid function with contract");
        raises(function() { sumR("5"); }, "Valid function with contract");
        strictEqual(sumR(1), 1, "Valid function with contract");

        strictEqual(noIntOutput(10.123), "string10.123", "Invalid function");
        strictEqual(noIntOutput("5"), "string5", "Invalid function");
        strictEqual(noIntOutput(1), "string1", "Invalid function");

        raises(function() { noIntOutputR(10.1234); }, "Invalid function with contract");
        raises(function() { noIntOutputR("5"); }, "Invalid function with contract");
        raises(function() { noIntOutputR(1); }, "Invalid function with contract");
    });

    test("String -> String functions", function() {
        function length(input) {
            return input.length;
        }

        var sumR = T("sum :: String -> String", sum);
        var lengthR = T("length :: String -> String", length);

        strictEqual(sum(5), 25, "Valid function");
        strictEqual(sum("5"), "055555", "Valid function");

        raises(function() { sumR(99); }, "Valid function with contract");
        raises(function() { sumR("Hello world"); }, "Valid function with contract");
        strictEqual(sumR("10"), "010101010101010101010", "Valid function with contract");

        strictEqual(length("How long is this?"), 17, "Invalid function");

        raises(function() { lengthR("How long is this?"); }, "Invalid function with contract");
    });

    test("Bool -> Bool functions", function() {
        function not(input) {
            return !input;
        }

        function notExpected(input) {
            return "not";
        }

        var notR = T("not :: Bool -> Bool", not);
        var notExpectedR = T("notExpected :: Bool -> Bool", notExpected);

        strictEqual(not(true), false, "Valid function");
        strictEqual(not("5"), false, "Valid function");
        strictEqual(not(5), false, "Valid function");

        strictEqual(notR(true), false, "Valid function with contract");
        raises(function() { notR("5"); }, "Valid function with contract");
        raises(function() { notR(5); }, "Valid function with contract");

        strictEqual(notExpected(true), "not", "Invalid function");
        strictEqual(notExpected("5"), "not", "Invalid function");
        strictEqual(notExpected(5), "not", "Invalid function");

        raises(function() { notExpectedR(true); }, "Invalid function with contract");
        raises(function() { notExpectedR("5"); }, "Invalid function with contract");
        raises(function() { notExpectedR(5); }, "Invalid function with contract");
    });

    test("Unit functions", function() {
        var x;

        function setValue(val) {
            x = val;
        }

        var setValueR = T("setValue :: Int -> Unit", setValue);

        setValueR(5);
        strictEqual(x, 5, "Setting a value to a variable");
        raises(function() { setValueR("String"); }, "Setting an invalid value");

        function badSetValue(val) {
            x = val;
            return false;
        }

        var badSetValueR = T("badSetValue :: Int -> Unit", badSetValue);

        raises(function() { badSetValueR(0); }, "Invalid function");
        raises(function() { badSetValueR("String"); }, "Invalid function");
        raises(function() { badSetValueR("undefined"); }, "Invalid function");
    });

    module("Polymorphic tests");

    test("a -> a functions", function () {
        function id(input) { return input; }

        var idR = T("id :: forall a. a -> a", id);

        function badId(input) { return input + "4"; }
        function badId2(input) { return "not your input"; }

        var badIdR = T("badId :: forall a. a -> a", badId);
        var badIdR2 = T("badId :: forall a. a -> a", badId2);

        strictEqual(id(4), 4, "Identity function");
        strictEqual(id("some string"), "some string", "Identity function");

        strictEqual(idR(4), 4, "Identity function with contract");
        strictEqual(idR("some string"), "some string", "Identity function with contract");

        strictEqual(badId(4), "44", "Violates contract by using input");
        strictEqual(badId("some string"), "some string4", "Violates contract by using input");

        raises(function() { badIdR(4); }, "Violates contract by using input, contract applied");
        raises(function() { badIdR("some string"); }, "Violates contract by using input, contract applied");

        strictEqual(badId2(4), "not your input", "Violates contract by replacing input");
        strictEqual(badId2("some string"), "not your input", "Violates contract by replacing input");

        raises(function() { badIdR2(4); }, "Violates contract by replacing input, contract applied");
        raises(function() { badIdR2("some string"); }, "Violates contract by replacing input, contract applied");
    });

    module("Box tests");

    test("a -> {field: a} functions", function () {
        function box(input) { return {field: input} };
        function badBox(input) { return {field2: input} };

        var boxR = T("box :: forall a. a -> {field: a}", box);
        var badBoxR = T("badBox :: forall a. a -> {fiel: a}", badBox);

        deepEqual(box(8), {field: 8}, "Valid box");
        deepEqual(box("ball"), {field: "ball"}, "Valid box");

        ok(boxR(8).field == 8, "Valid box with contract");
        ok(boxR("ball").field == "ball", "Valid box with contract");

        deepEqual(badBox(8), {field2: 8}, "Invalid box");
        deepEqual(badBox("ball"), {field2: "ball"}, "Invalid box");

        raises(function() { badBoxR(8); }, "Invalid box with contract");
        raises(function() { badBoxR("ball"); }, "Invalid box with contract");
    });

    module("Object tests");

    test("Object restrictions", function () {
        function TestObject() {
            this.a = 5;
            this.b = function(input) { return input + this.a };
        }

        function processObject(o) {
            var a = o.b(o.a);
            return a;
        }

        var processObjectR = T("processObject :: {a: Int, b: Int -> Int} -> Int", processObject);
        var processObjectRb = T("processObject :: {a: Int, b: Int -> Int} @ TestObject -> Int", processObject);

        function anotherTestObject() {
            this.a =  4;
            this.b = function(a) { return a + 3};
        }

        function badObject() {
            this.a = 4;
            this.b = function(a) { return "foo"};
        }

        strictEqual(processObject(new TestObject()), 10, "Valid object");
        raises(function() { processObject(new Object()); }, "Invalid empty object");
        strictEqual(processObject(new anotherTestObject()), 7, "Valid object");
        strictEqual(processObject(new badObject()), "foo", "Invalid object");

        strictEqual(processObjectR(new TestObject()), 10, "Valid object with contract");
        raises(function() { processObjectR(new Object()); }, "Invalid empty object with contract");
        strictEqual(processObjectR(new anotherTestObject()), 7, "Valid object with contract");
        raises(function() { processObjectR(new badObject()); }, "Invalid object with contract");

        strictEqual(processObjectRb(new TestObject()), 10, "Valid object with contract using @TestObject");
        raises(function() { processObjectRb(new Object()); }, "Invalid empty object with contract using @TestObject");
        raises(function() { processObjectRb(new anotherTestObject()); }, "Valid object with contract using @TestObject");
        raises(function() { processObjectRb(new badObject()); }, "Invalid object with contract @TestObject");
    });

    test("Passing between multiple functions", function() {
        function getPerson(input) {
            return {age: input, gender: "male"};
        }

        var getPersonR = T("getPerson :: Int -> {age: Int, gender: String}", getPerson);

        var sam = getPersonR(20);

        function chill(p) {
            return 15;
        }

        var chillR = T("chill :: {age: Int, gender: String} -> Int", chill);

        strictEqual(chillR(sam), 15, "Valid object")
        raises(function() { chillR({age: "young", gender: "not sure"}); }, "Invalid object");

        function noBoundary(p) {
            p.age = "old";
            return 50;
        }

        var joe = getPersonR(30);

        raises(function() { noBoundary(joe); }, "Function trying to modify protected object");
        //TODO:
        //strictEqual(noBoundary(sam), 50, "Function modifying unprotected object");
        // Not sure if the above is expected behaviour
        // Sam was restricted then relaxed while Joe was restricted, but should they behave in 
        // the same way when passed into this function? Not sure if the current result makes 
        // much sense.

        deepEqual(sam, {age: 20, gender: "male"}, "Should be identical to how it started");
    });

    test("Manipulating objects", function() {
        function manipulate(o) {
            o.a = 15;
            return 5;
        }

        function TestObject() {
            this.a = 5;
            this.b = function(input) { return input + this.a };
        }

        var myObject = new TestObject();

        var manipulateR = T("manipulate :: {a: Int, b: Int -> Int} -> Int", manipulate);
        var myObjectR = T("myObject :: {a: Int, b: Int -> Int}", myObject);

        strictEqual(manipulateR(myObjectR), 5, "Changing the value inside an object");
        strictEqual(myObject.a, 15, "Changing the value inside an object");

        function badManipulate(o) {
            o.b = "hehe";
            return 5;
        }

        var badManipulateR = T("badManipulate :: {a: Int, b: Int -> Int} -> Int", badManipulate);

        //TODO:
        // Unsure of expected behaviour - see above
        raises(function() { badManipulateR(myObject); }, "Manipulating an object incorrectly");
    });

    module("Map tests");

    test("Using lists and maps", function () {
        var map = function(a, b) { return Array.prototype.map.call(a, function(x, y, z) { return b(x) }); }
        var mapR = T("map :: forall a b. [a] -> (a -> b) -> [b]", map);

        function badMap(list, f) {
            list[0] = f(list[0]);
            return list;
        }

        var badMapR = T("badMap :: forall a b. [a] -> (a -> b) -> [b]",badMap);

        function sneakyMap(list, f) {
            var out = map(list, f);
            out[0]++;
            return out;
        }

        var sneakyMapR = T("badMap :: forall a b. [a] -> (a -> b) -> [b]",sneakyMap);

        function increment(a) {
            return a + 1;
        }

        deepEqual(map([1,2,3], increment), [2,3,4], "Valid map");
        deepEqual(map([1,2], increment), [2,3], "Valid map");
        deepEqual(map([1], increment), [2], "Valid map");

        deepEqual(mapR([1,2,3], increment), [2,3,4], "Valid map with contract");
        deepEqual(mapR([1,2], increment), [2,3], "Valid map with contract");
        deepEqual(mapR([1], increment), [2], "Valid map with contract");

        deepEqual(badMap([1,2,3], increment), [2,2,3], "Bad map");
        deepEqual(badMap([1,2], increment), [2,2], "Bad map");
        deepEqual(badMap([1], increment), [2], "Bad map");

        raises(function () { badMapR([1,2,3], increment); }, "Bad map with contract");
        raises(function () { badMapR([1,2], increment); }, "Bad map with contract");
        deepEqual(badMapR([1], increment), [2], "Bad map with contract");

        deepEqual(sneakyMap([1,2,3], increment), [3,3,4], "Sneaky map");
        deepEqual(sneakyMap([1,2], increment), [3,3], "Sneaky map");
        deepEqual(sneakyMap([1], increment), [3], "Sneaky  map");

        raises(function () { sneakyMapR([1,2,3], increment); }, "Bad map with contract");
        raises(function () { sneakyMapR([1,2], increment); }, "Bad map with contract");
        raises(function () { sneakyMapR([1], increment); }, "Bad map with contract");
    });

    test("Multiple input functions", function() {
        function add(a, b) {
            return a + b;
        }

        var addR = T("add :: Int -> Int -> Int", add);

        strictEqual(add(10, 10), 20, "No contract");
        ok(isNaN(add(10)), "No contract");
        raises(function () { add(10)(10); }, "Currying");

        strictEqual(addR(10, 10), 20, "With contract");
        addR(10); // Returns the partially applied function
        strictEqual(addR(10)(10), 20, "Currying with contract");

        function addMore(a, b, c) {
            return a + b + c;
        }

        var addMoreR = T("addMore :: Int -> Int -> Int -> Int", addMore);

        raises(function() { addMore(10)(9)(8); }, "Three input function, no contract");
        raises(function() { addMore(10, 9)(8); }, "Three input function, no contract");
        strictEqual(addMore(10, 9, 8), 27, "Three input function, no contract");

        strictEqual(addMoreR(10)(9)(8), 27, "Three input function, with contract");
        strictEqual(addMoreR(10, 9)(8), 27, "Three input function, with contract");
        strictEqual(addMoreR(10, 9, 8), 27, "Three input function, with contract");
    });

    module("List tests");

    test("Pushing onto lists", function() {
        function append (list, item) {
            list.push(item);
            return list;
        }

        var appendR = T("append :: forall a. [a] -> a -> [a]",append);

        function badAppend(list, item) {
            var item2 = 1;
            list.push(item2);
            return list;
        }

        var badAppendR = T("badappend :: forall a. [a] -> a -> [a]", badAppend);

        deepEqual(append([1,2,3], 1), [1,2,3,1], "Appending to a list");
        deepEqual(append([1,2,3], "hello"), [1,2,3,"hello"], "Appending to a list");
        deepEqual(append([1,2,"sneaky"], 1), [1,2,"sneaky",1], "Appending to a list");

        deepEqual(appendR([1,2,3], 1), [1,2,3,1], "Appending to a list with contract");
        raises(function() { appendR([1,2,3], "hello"); }, "Appending to a list with contract");
        raises(function() { appendR([1,2,"sneaky"], 1); }, "Appending to a list with contract");

        deepEqual(badAppend([1,2,3], 1), [1,2,3,1], "Bad appending to a list");
        deepEqual(badAppend([1,2,3], "hello"), [1,2,3,1], "Bad appending to a list");
        deepEqual(badAppend([1,2,"sneaky"], 1), [1,2,"sneaky",1], "Bad appending to a list");

        raises(function() { badAppendR([1,2,3], 1); }, "Bad appending to a list with contract");
        raises(function() { badAppendR([1,2,3], "hello"); }, "Bad appending to a list with contract");
        raises(function() { badAppendR([1,2,"sneaky"], 1); }, "Bad appending to a list with contract");

        function getList(item) {
            return [item];
        }

        var getListR = T("getList :: forall a. a -> [a]", getList);

        deepEqual(getListR("string"), ["string"], "Getting a list");
        deepEqual(getListR(0), [0], "Getting a list");
        var result = getListR(0);
        result.push(1);
        deepEqual(result, [0, 1], "Valid append to a list with contract");
        raises(function() { getListR(0).push("asdf"); }, "Invalid append to list with contract");
    });

    module("Dictionary tests");

    test("Looking up dictionaries", function() {
        function lookup(key, dict) {
            return dict[key];
        }

        var lookupR = T("lookup :: forall b . String -> <b> -> b", lookup);

        function badLookup(key, dict) {
            return 3;
        }

        var badLookupR = T("lookup :: forall b . String -> <b> -> b", badLookup);

        strictEqual(lookup("3", {3: "foo"}), "foo", "Valid lookup");
        strictEqual(lookup("3", {3: 4}), 4, "Valid lookup");
        strictEqual(lookup("foo", {3: "foo"}), undefined, "No matching entry");
        strictEqual(lookup("3", {3: "foo", 4: 5}), "foo", "Mixed dictionary");

        strictEqual(lookupR("3", {3: "foo"}), "foo", "Valid lookup with contract");
        strictEqual(lookupR("3", {3: 4}), 4, "Valid lookup with contract");
        //TODO:
        // Should pass, currently fails. It does not return type b, but
        // it shouldn't really be expected to when the entry doesn't exist
        // strictEqual(lookupR("foo", {3: "foo"}), undefined, "No matching entry with contract");
        raises(function() { lookupR("3", {3: "foo", 4: 5}); }, "Mixed dictionary with contract");

        strictEqual(badLookup("3", {3: "foo"}), 3, "Valid lookup");
        strictEqual(badLookup("3", {3: 4}), 3, "Valid lookup");
        strictEqual(badLookup("foo", {3: "foo"}), 3, "No matching entry");
        strictEqual(badLookup("3", {3: "foo", 4: 5}), 3, "Mixed dictionary");

        raises(function() { badLookupR("3", {3: "foo"}); }, "Bad lookup  with contract");
        raises(function() { badLookupR("3", {3: 4}); }, "Bad lookup with contract");
        raises(function() { badLookupR("foo", {3: "foo"}); }, "Bad lookup with contract");
        raises(function() { badLookupR("3", {3: "foo", 4: 5}); }, "Bad lookup with contract");
    });

    module("Typedef tests");

    test("Declaring and using typedefs", function() {
        T("typedef Person :: {age: Int, name: String}");
        T("typedef Male :: Person");
        function getAge(person) {
            return person.age;
        }

        var getAgeR = T("getAge :: Person -> Int", getAge);
        var getAgeR2 = T("getAge :: Male -> Int", getAge);

        strictEqual(getAgeR({age: 15, name: "Joe"}), 15, "Valid person");
        raises(function() { getAgeR({age: "fifteen", name: "Joe"}); }, "Invalid person");
        raises(function() { getAgeR({age: 15, name: 15}); }, "Invalid person");
        strictEqual(getAgeR({age: 15, name: "Joe", gender: "M"}), 15, "Valid person, adding attributes");

        strictEqual(getAgeR2({age: 15, name: "Joe"}), 15, "Valid person, ref another typedef");
        raises(function() { getAgeR2({age: "fifteen", name: "Joe"}); }, "Invalid person, ref another typedef");
        raises(function() { getAgeR2({age: 15, name: 15}); }, "Invalid person, ref another typedef");
        strictEqual(getAgeR2({age: 15, name: "Joe", gender: "M"}), 15, "Valid person, adding attributes, ref another typedef");

        raises(function() { T("typedef Int :: NotInt"); }, "Invalid typedef using reserved keywords");
        raises(function() { T("typedef String :: NotString"); }, "Invalid typedef using reserved keywords");
        raises(function() { T("typedef Bool :: NotBool"); }, "Invalid typedef using reserved keywords");

    });

    test("Merge operation on record types", function () {
        T("typedef Reader :: {read: Int -> String, readLine: Int -> String}");
        T("typedef FileReader :: {name : String, size : Int} U Reader");

        function reader () {
            this.read = function (len) {
                return "a";
            };
            this.readLine = function (len) {
                return "abc\n";
            };
        }

        function fileReader () {
            this.name = "My File";
            this.size = 10000;
            this.read = function (len) {
                return "x";
            };
            this.readLine = function (len) {
                return "xyz\n";
            };
        }

        function badFileReader () {
            this.name = "My File";
            this.size = 10000;
        }

        function parse (reader) {
            return true;
        }

        var parseR = T("parse :: Reader -> Bool", parse);
        var parseR2 = T("parse :: FileReader -> Bool", parse);

        strictEqual(parseR(new reader()), true, "Valid reader");
        strictEqual(parseR2(new fileReader()), true, "Valid file reader");
        strictEqual(parseR(new fileReader()), true, "Valid file reader");
        raises(function() { parseR2(new reader()); }, "Invalid reader passed in");
        raises(function() { parseR2(new badFileReader()); }, "Bad file reader passesd in");

        T("typedef Buffered :: {buffered: Bool}");
        T("typedef Valid :: {valid: Bool}");
        T("typedef ValidBufferedFileReader :: {name: String, size: Int} U Buffered U Valid");
        T("typedef ValidBufferedFileReader2 :: FileReader U Buffered U Valid");

        function validBufferedFileReader () {
            this.name = "My File";
            this.size = 10000;
            this.read = function (len) {
                return "x";
            };
            this.readLine = function (len) {
                return "xyz\n";
            };
            this.buffered = true;
            this.valid = true;
        }

        function invalidBufferedFileReader () {
            this.name = "My File";
            this.size = 10000;
            this.read = function (len) {
                return "x";
            };
            this.readLine = function (len) {
                return "xyz\n";
            };
            this.buffered = 0;
            this.valid = "";
        }

        var parseR3 = T("parse :: ValidBufferedFileReader -> Bool", parse);
        var parseR4 = T("parse :: ValidBufferedFileReader2 -> Bool", parse);

        strictEqual(parseR3(new validBufferedFileReader()), true, "Valid reader");
        strictEqual(parseR4(new validBufferedFileReader()), true, "Valid reader");

        raises(function() { parseR3(new invalidBufferedFileReader()); }, "Invalid reader passed in");
        raises(function() { parseR4(new invalidBufferedFileReader()); }, "Invalid reader passed in");
    });

    module("Maybe tests");

    test("Using the maybe type", function() {
        function nullable(num) {
            return null;
        }

        var nullableR = T("nullable :: Int -> Int", nullable);

        raises(function() { nullableR(5); }, "Non-nullable result allowed");

        var nullableR2 = T("nullable :: Int -> Int?", nullable);

        strictEqual(nullableR2(5), null, "Nullable result allowed");

        var nullableR3 = T("nullable :: Int? -> Int?", nullable);

        strictEqual(nullableR3(null), null, "Nullable parameter and result allowed");

        function len(str) {
            return str ? str.length : 0;
        }

        var lenR = T("len :: String? -> Int?", len);

        strictEqual(lenR("Hello"), 5, "Nullable parameter");
        strictEqual(lenR(null), 0, "Nullable paramter");
        strictEqual(lenR(undefined), 0, "Nullable paramter");

        function lookup(key, dict) {
            return dict[key];
        }

        var lookupR = T("lookup :: forall b. String -> <b> -> b?", lookup);

        strictEqual(lookupR("foo", {bar: "hello"}), undefined, "Return null since not found");
        raises(function() { lookupR("bar", {bar: "hello", foo: null}); } , "Null dictionary unallowed");
        raises(function() { lookupR("bar", {bar: "hello", foo: undefined}); } , "Null dictionary unallowed");
    });

    test("Mixing the maybe type with other contracts", function() {
        // Functions
        function apply(fn, arg) {
            return fn != null ? fn(arg) : null;
        }

        var applyR = T("apply :: (Int -> Int)? -> Int -> Int", apply);

        strictEqual(applyR(function increment (num) { return ++num; }, 9), 10, "Maybe function");
        raises(function() { applyR(null, 9); }, "Maybe function");
        raises(function() { applyR(undefined, 9); }, "Maybe function");

        var applyR2 = T("apply :: (Int -> Int)? -> Int -> Int?", apply);

        strictEqual(applyR2(function increment (num) { return ++num; }, 9), 10, "Maybe function");
        strictEqual(applyR2(null, 9), null, "Maybe function");
        strictEqual(applyR2(undefined, 9), null, "Maybe function");

        // Lists, type variables
        function append(list, item) {
            if (list == null) {
                list = [];
            }
            list.push(item);
            return list;
        }

        var appendR = T("append :: forall a. [a?] -> a -> [a?]", append);

        deepEqual(appendR([1,2,3], 4), [1,2,3,4], "[a?] Valid append");
        deepEqual(appendR([0,0,0], 0), [0,0,0,0], "[a?] Valid append");
        deepEqual(appendR([1,null,3], 4), [1,null,3,4], "[a?] Lists with nulls");
        raises(function() { appendR(null, 4); }, "[a?] Invalid list");

        raises(function() {
            var appendR2 = T("append :: forall a?. [a] -> a -> [a]", append);
        }, "forall a?. Invalid use of maybe");

        var appendR3 = T("append :: forall a. [a]? -> a -> [a]", append);

        deepEqual(appendR3([1,2,3], 4), [1,2,3,4], "[a]? Valid append");
        deepEqual(appendR3([0], 0), [0,0], "[a]? Valid append");
        raises(function() { appendR3([1,null,3], 4); }, "[a]? Invalid list with nulls");
        deepEqual(appendR3(null, 4), [4], "[a]? Null list");

        // Maps
        function lookup(key, dict) {
            return dict != null ? dict[key] : null;
        }

        var lookupR = T("lookup :: forall b. String -> <b>? -> b?", lookup);

        strictEqual(lookupR("water", {water: "liquid"}), "liquid", "<b>? Valid lookup");
        strictEqual(lookupR("", {water: "liquid"}), undefined, "<b>? Valid lookup");
        strictEqual(lookupR("water", null), null, "<b>? Valid lookup with null map");
        raises(function() { lookupR(null, {water: "liquid"}); }, "<b>? Invalid lookup");
        raises(function() { lookupR(water, {water: "liquid", steam: null}); }, "<b>? Invalid lookup");
        strictEqual(lookupR("water", undefined), null, "<b>? Valid lookup with null map");
        raises(function() { lookupR(undefined, {water: "liquid"}); }, "<b>? Invalid lookup");
        raises(function() { lookupR(water, {water: "liquid", steam: undefined}); }, "<b>? Invalid lookup");

        // Objects
        function getName(person) {
            return person != null ? person.name : null;
        }

        var getNameR = T("getName :: {name: String, age: Int}? -> String?", getName);

        strictEqual(getNameR({name: "Sam", age: 15}), "Sam", "{...}? Valid object");
        strictEqual(getNameR(null), null, "{...}? Valid null object");
        strictEqual(getNameR(undefined), null, "{...}? Valid null object");
        strictEqual(getNameR({name: "", age: 0}), "", "{...}? Valid object");
        raises(function() { getNameR({name: "Sam"}); }, "{...}? Invalid object");

        var getNameR2 = T("getName :: {name: String, age: Int?} -> String", getName);

        strictEqual(getNameR2({name: "Sam", age: 15}), "Sam", "{..?} Valid object");
        raises(function() { getNameR2(null); }, "{..?} Invalid null object");
        raises(function() { getNameR2(undefined); }, "{..?} Invalid null object");
        strictEqual(getNameR({name: "", age: 0}), "", "{...}? Valid object");
        strictEqual(getNameR2({name: "Sam", age: null}), "Sam", "{..?} Invalid object");
        strictEqual(getNameR2({name: "Sam", age: undefined}), "Sam", "{..?} Invalid object");

        function createPerson(name) {
            return {name: name, age: null};
        }

        var createPersonR = T("createPerson :: String -> {name: String, age: Int?}", createPerson);

        ok(createPersonR("Sam").name == "Sam", "Valid null field");
    });

    test("Passing between multiple functions", function() {
        function len(word) {
            return word.length > 5 ? word.length : null;
        }

        var lenR = T("len :: String -> Int?", len);

        strictEqual(lenR("Hello world"), 11, "Valid parameters");
        strictEqual(lenR("Hello"), null, "Valid null parameters");
        strictEqual(lenR(""), null, "Valid null parameters");

        function apply(fn, str) {
            return fn(str);
        }

        var applyR = T("apply :: (String -> Int) -> String -> Int", apply);

        strictEqual(applyR(lenR, "Hello world"), 11, "Valid parameters");
        raises(function() { applyR(lenR, "Hello"); }, "Invalid parameters");
        raises(function() { applyR(lenR, ""); }, "Invalid parameters");
    });

    module("Function tests");

    test("Returning functions", function() {
        function getFn(num) {
            return function (str) { return str.length; };
        }

        var getFnR = T("getFn :: Int -> (String -> Int)", getFn);

        var fn = getFnR(500);
        strictEqual(fn("String"), 6, "Valid returning function being called");

        function id(x) { return x; }

        var idR = T("id :: (String -> Int) -> (String -> Int)", id);

        strictEqual(idR(getFnR(5))("Hello"), 5, "Valid chaining of functions");
        strictEqual(idR(getFnR(5), "Hello"), 5, "Valid chaining of functions");
        raises(function() { idR(getFnR, 5, "Hello"); }, "Invalid chaining of functions");

        var idR = T("id :: (Int -> (String -> Int)) -> (Int -> (String -> Int))", id);

        strictEqual(idR(getFn)(1)(""), 0, "Valid chaining of functions");
        strictEqual(idR(getFn, 1)(""), 0, "Valid chaining of functions");

        function add(a, b, c) {
            return function (str) { return a + b + c + str.length; };
        }

        var addR = T("add :: Int -> Int -> Int -> (String -> Int)", add);
        var addR2 = T("add :: Int -> Int -> Int -> String -> Int", add);

        strictEqual(addR(5, 2, 3)(""), 10, "More parameters");
        strictEqual(addR(5, 2, 3)(""), 10, "More parameters, without brackets");
    });

    module("No parameters");

    test("Using no parameters using explicit brackets", function() {
        function getSize() {
            return 5000;
        }

        var getSizeR = T("getSize :: 0 -> Int", getSize);
        raises(function () { T("getSize :: 0", getSize); }, "Invalid use of no params");
        raises(function () { T("getSize :: Int -> 0", getSize); }, "Invalid use of no params");

        strictEqual(getSizeR(), 5000, "No parameters passed");
        raises(function () { getSizeR(500); }, "Calling empty function with params");
        raises(function () { getSizeR(undefined, 500, 500); }, "Calling empty function with params");

        function pointless(num, fn) {
            return fn();
        }

        var pointlessR = T("pointless :: Int -> (0 -> Int) -> Int", pointless);

        strictEqual(pointlessR(500, getSizeR), 5000, "Valid chain, explicit brackets");

        //var pointlessR2 = T("pointless :: Int -> 0 -> Int -> Int", pointless);

        //strictEqual(pointlessR2(500, getSizeR), 5000, "Valid chain, no brackets");

        function add(num, fn) {
            return function() { return num + fn(); };
        }

        var addR = T("add :: Int -> (0 -> Int) -> (0 -> Int)", add);
        raises(function () { T("add :: Int -> (0 -> Int) -> 0", add); }, "Invalid use of no params");

        strictEqual(addR(1000, getSize)(), 6000, "Valid chain of functions, explicit brackets");
/*
        var addR2 = T("add :: Int -> 0 -> Int -> 0 -> Int", add);

        strictEqual(addR2(1000, getSize)(), 6000, "Valid chain of functions, no brackets");

        function addMore(a,b,fn) {
            return function() { return a+b+fn(); };
        }

        var addMoreR = T("addMore :: Int -> Int -> 0 -> Int -> 0 -> Int", addMore);

        strictEqual(addMore(5, 100, getSize)(), 5105, "More parameters");
*/
        function nothing() {}

        var nothingR = T("nothing :: 0 -> Int?", nothing);

        strictEqual(nothingR(), undefined, "Mixing empty params with maybe type");

        function tricky(a) {
            return nothing;
        }

        var trickyR = T("tricky :: Int -> 0 -> String?", tricky);

        strictEqual(trickyR(100)(), undefined, "Mixing empty params with maybe type");

        /*function wrap() {
            return addMore;
        }

        var wrapR = T("wrap :: 0 -> (Int -> Int -> 0 -> Int -> 0 -> Int)", wrap);

        strictEqual(wrap()(5, 100, getSize)(), 5105, "Valid chaining of functions");
        */

        var x = 5;
        function incrementGlobal () {
            x++;
        }

        var incrementGlobal = T("incrementGlobal :: 0 -> Unit", incrementGlobal);

        incrementGlobal();
        strictEqual(x, 6, "Using with unit type");
    });

    test("Using no parameters with implcit bracketing", function() {
        var health = 90;

        function getHealth() {
            return health;
        }

        function setHealth(h) {
            health = h;
            return getHealth;
        }

        var setHealthR = T("setHealth :: Int -> (0 -> Int)", setHealth);
        var setHealthR2 = T("setHealth2 :: Int -> 0 -> Int", setHealth);

        strictEqual(setHealthR(80)(), 80, "Valid use of no params");
        strictEqual(setHealthR2(80)(), 80, "Valid use of no params, implicit bracketing");

        function getSetHealth() {
            return function () { return setHealth; };
        }

        getSetHealthR = T("getSetHealth :: 0 -> (0 -> (Int -> (0 -> Int)))", getSetHealth);
        getSetHealthR2 = T("getSetHealth :: 0 -> 0 -> Int -> 0 -> Int", getSetHealth);

        strictEqual(getSetHealthR()()(70)(), 70, "Valid use of no params");
        strictEqual(getSetHealthR2()()(70)(), 70, "Valid use of no params, implicit bracketing");
    });
    module("Algebraic data types");

    test("Basic ADTs", function() {
        var BTree = D("BTree = Empty | Leaf Int as value | Node BTree as left BTree");

        function doNothing(tree) {
            return true;
        }

        function leftValue(tree) {
            if (tree.isNode()) {
                return tree.left;
            }
        }

        function rightValue(tree) {
            if (tree.isNode()) {
                return tree[1];
            }
        }

        var doNothingR = T("doNothing :: BTree -> Bool", doNothing);

        var leftValueR = T("leftValue :: BTree -> BTree?", leftValue);
        var rightValueR = T("rightValue :: BTree -> BTree?", rightValue);

        var tree = BTree.Node(BTree.Empty(), BTree.Leaf(4));

        strictEqual(doNothingR(tree), true, "Valid tree");
        strictEqual(doNothingR(BTree.Node(tree, BTree.Leaf(4))), true, "Valid tree");
        raises(function () { doNothingR(BTree.Node(BTree.Empty(), 4)); }, "Invalid tree");
        raises(function () { doNothingR(4); }, "Invalid tree");
        raises(function () { doNothingR(BTree.Node(BTree.Empty(), BTree.Leaf("4"))); }, "Invalid tree");

        ok(leftValueR(tree), "Valid lookup");
        strictEqual(leftValueR(BTree.Empty()), undefined, "Valid lookup");
        ok(leftValueR(BTree.Node(BTree.Node(BTree.Empty(), BTree.Leaf(4)), BTree.Leaf(5))), "Valid lookup");

        ok(rightValueR(tree), "Valid lookup");
        strictEqual(rightValueR(BTree.Empty()), undefined, "Valid lookup");
        ok(rightValueR(BTree.Node(BTree.Node(BTree.Empty(), BTree.Leaf(4)), BTree.Leaf(5))), "Valid lookup");
    });

    test("Basic pattern matching", function() {
        var BTree = D("BTree = Leaf Int| Node BTree BTree");

        function depth (tree) {
            var m = BTree.matcher(depth, "m");
            m.Leaf("_")(function () { return 1; });
            m.Node("a", "b")(function() { return Math.max(depth(m.a), depth(m.b)) + 1; });
            return m(tree);
        }

        strictEqual(depth(BTree.Leaf(4)), 1, "Valid depth function");
        strictEqual(depth(BTree.Node(BTree.Leaf(4), BTree.Leaf(5))), 2, "Valid depth function");
    });

    test("More complicated pattern matching", function() {
        var BTree = D("BTree = Leaf Int| Node BTree BTree");
        function diffDepth (tree) {
            var m = BTree.matcher();
            m.Node(m.Node(m.Leaf(5), "a"), m.Node("b", "_"))(function () { return Math.max(diffDepth(m.a), diffDepth(m.b)) + 100; } );
            m.Leaf("_")(function () { return 1; });
            m.Node("a", "b")(function() { return Math.max(diffDepth(m.a), diffDepth(m.b)) + 1; });
            return m(tree);
        }

        strictEqual(diffDepth(
                    BTree.Node(
                        BTree.Node(
                            BTree.Leaf(5),
                            BTree.Leaf(4)),
                        BTree.Node(
                            BTree.Leaf(3),
                            BTree.Leaf(2)))
                    ), 101, "Valid depth function with more patterns");
        strictEqual(diffDepth(
                    BTree.Node(
                        BTree.Node(
                            BTree.Leaf(100),
                            BTree.Leaf(4)),
                        BTree.Node(
                            BTree.Leaf(3),
                            BTree.Leaf(2)))
                    ), 3, "Valid depth function with more patterns");
        strictEqual(diffDepth(
                    BTree.Node(
                        BTree.Node(
                            BTree.Leaf(5),
                            BTree.Node(
                                BTree.Leaf(6),
                                BTree.Leaf(7))),
                        BTree.Node(
                            BTree.Leaf(3),
                            BTree.Leaf(2)))
                    ), 102, "Valid depth function with more patterns");
    });

    test("Pattern matching using default patterns", function() {
        var BTree = D("BTree = Leaf Int| Node BTree BTree");

        function depth (tree) {
            var m = BTree.matcher(depth, "m");
            m.Leaf("_")(function () { return 1; });
            m.Node("a", "b")(function() { return Math.max(depth(m.a), depth(m.b)) + 1; });
            return m(tree);
        }

        function defaultTest(tree) {
            var n = BTree.matcher(defaultTest);
            n.Leaf("_")(function () { return 1; });
            n._()(function () { return 0; });
            return n(tree);
        }

        strictEqual(defaultTest(BTree.Leaf(5)), 1, "Valid function using default pattern");
        strictEqual(defaultTest(BTree.Node(BTree.Leaf(5), BTree.Leaf(1))), 0, "Valid function using default pattern");

        function defaultTester(tree) {
            var p = BTree.matcher(defaultTester);
            p._("c")(function () { return depth(p.c); });
            return p(tree);
        }

        strictEqual(defaultTester(BTree.Leaf(4)), 1, "Valid function using default pattern");
        strictEqual(defaultTester(BTree.Node(BTree.Leaf(4), BTree.Leaf(5))), 2, "Valid function using default pattern");
    });

    test("Pattern matching using literal strings", function() {
        var BTree = D("BTree = Leaf String| Node BTree BTree");

        function depth (tree) {
            var m = BTree.matcher(depth, "m");
            m.Leaf("'hello")(function () { return 500; });
            m.Leaf("_")(function () { return 1; });
            m.Node("a", "b")(function() { return Math.max(depth(m.a), depth(m.b)) + 1; });
            return m(tree);
        }

        strictEqual(depth(BTree.Leaf("hello")), 500, "Valid depth function");
        strictEqual(depth(BTree.Leaf("asd")), 1, "Valid depth function");
        strictEqual(depth(BTree.Node(BTree.Leaf("asd"), BTree.Leaf("hello"))), 501, "Valid depth function");
    });
});
