# Test coverage #
High test coverage is important. At the moment we are using JSCoverage.

The user manual can be found at http://siliconforks.com/jscoverage/manual.html

Note: It has a bug on Mac, fix is here: http://siliconforks.com/jscoverage/bugs/33

Instrument and execute the code using:
```
jscoverage ristretto-js ristretto-js-instrumented
cd ristretto-js-instrumented
jscoverage-server
```

Then simply open up a browser and enter
```
localhost:8080/jscoverage.html
```
In the box that comes up enter:
```
qunit.html
```