## 2015-03-26, Version 2.0.0

 - Remove webpack dependencies
 - Remove middlewares
 - Add Middlewares loader
 - CLI loads the local neonode module if its run from inside a neonode project, it loads the global module otherwise
 - Lithium performance.now returns a hrtime() in microseconds in node now
 - Move connect-redis to base
