'use strict';

angular.isEmptyString = function(val) {
  return angular.isString(val) && val.length === 0;
};

angular.isUndefinedOrNull = function(val) {
  return angular.isUndefined(val) || val === null;
};

// Declare app level module which depends on filters, and services
// first agument is name of angular module second argument is option, but if list, then these are the angular dependencies
// Without second argument would look for an existant module called 'analyst'
// elements of list correspond to files in js folder
angular.module('flotTest', [
  'flotTest.directives',
  'flotTest.controllers'
])
;