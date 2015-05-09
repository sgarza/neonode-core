## 2015-05-08, Version 2.1.8

 - Added before/after Create and Update events to KnexModel

## 2015-05-08, Version 2.1.7

 - Fixed typo in KnexStorage


## 2015-05-07, Version 2.1.6

 - Removed passport Local Strategy, passport strategies should be installed in the neonode project.


## 2015-05-06, Version 2.1.5

 - Add setProperties to KnexModel


## 2015-05-06, Version 2.1.4

 - ValidationSupport now runs checkit with promises instead of validateSync()


## 2015-05-06, Version 2.1.3

 - Fixed a data validation issue in the KnexStorage processor


## 2015-05-04, Version 2.1.2

 - Fixed typos in ValidationSupport
 - Clean _csfr in KnexStorage.preprocessors
 - Add createdAt and updatedAt to KnexModel
 - Add Preprocessor to convert from camelcase to underscored column names
 - Add Processor to convert from underscored to camelcase column names
 - Add underscore.string module
 - Use constructor.validations in ValidationSupport


## 2015-05-04, Version 2.1.1

 - Move router middleware from Application.js to neonode middlewares


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
