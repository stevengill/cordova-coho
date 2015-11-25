/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/



var path = require('path');
var apputil = require('./apputil');
var shelljs = require('shelljs');
var executil = require('./executil');
var gitutil = require('./gitutil');
var repoutil = require('./repoutil');
var repoupdate = require('./repo-update');
var print = apputil.print;

console.log('hhhhh')
var hasBuiltJs = '';
var t = "true";
var f = "false";
function cpAndLog(src, dest) {
    print('Coping File:', src, '->', dest);
    // Throws upon failure.
    shelljs.cp('-f', src, dest);
    if (shelljs.error()) {
        apputil.fatal('Copy failed.');
    }
}
exports.copyRepo = function(repo, version) {
console.log('blah')
  function *ensureJsIsBuilt() {
      var cordovaJsRepo = repoutil.getRepoById('js');

      if (hasBuiltJs != version) {
          yield repoutil.forEachRepo([cordovaJsRepo], function*() {
              yield gitutil.stashAndPop(cordovaJsRepo, function*() {
                  //git fetch and update master for cordovajs
                  yield repoupdate.updateRepos([cordovaJsRepo], ['master'], false);
                  yield gitutil.gitCheckout('master');
                  yield executil.execHelper(executil.ARGS('grunt compile:' +repo.id + ' --platformVersion='+version));
                  hasBuiltJs = version;
              });
          });
      }
  }

  if (repoutil.repoGroups.platform.indexOf(repo) == -1) {
      return f ;
  }

  if (repo.cordovaJsPaths) {
      yield ensureJsIsBuilt();
      repo.cordovaJsPaths.forEach(function(jsPath) {
          var src = path.join('..', 'cordova-js', 'pkg', repo.cordovaJsSrcName || ('cordova.' + repo.id + '.js'));
          cpAndLog(src, jsPath);
      });
      return t;
  } else if (repoutil.repoGroups.all.indexOf(repo) != -1) {
      //print('*** DO NOT KNOW HOW TO UPDATE cordova.js FOR THIS REPO ***');
      return f;
  }

}
console.log('there')
exports.something = function() {
  console.log('here1')
  return false
}
