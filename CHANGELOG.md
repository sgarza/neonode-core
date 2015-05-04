## 2015-05-04, Version 2.1.0

 - Added [Checkit](https://github.com/tgriesser/checkit) npm module for validations
 - Added Argon Models (Argon.KnexModel)
 - Added KnexStorage for Argon
 - Added ValidationsSupport Neon Module to use with Argon.KnexModel


## 2015-03-30, Version 2.0.1

 - Remove socket.io and async from dependencies
 - Move express router initialization and router middleware before external middlewares


## 2015-03-26, Version 2.0.0

 - Remove webpack dependencies
 - Remove middlewares
 - Add Middlewares loader
 - CLI loads the local neonode module if its run from inside a neonode project, it loads the global module otherwise
 - Lithium performance.now returns a hrtime() in microseconds in node now
 - Move connect-redis to base
