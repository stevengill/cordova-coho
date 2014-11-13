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

var executil = require('./executil');
var optimist = require('optimist');
var flagutil = require('./flagutil');
var repoutil = require('./repoutil');
var repoupdate = require('./repo-update');
var retrieveplatforms = require('./retrieve-platforms');
var npmpublish = require('./npm-publish');
var versionutil = require('./versionutil');
var gitutil = require('./gitutil');
var fs = require('fs');
var path = require('path');
var npmlink = require('./npm-link');

function *prepareToolsRelease(argv) {
    var tools = flagutil.computeReposFromFlag('tools');
    var platforms = flagutil.computeReposFromFlag('active-platform');
    var cli = repoutil.getRepoById('cli');
    var cordovaLib = repoutil.getRepoById('lib');
    var plugman = repoutil.getRepoById('plugman');
    var opt = flagutil.registerHelpFlag(optimist);

    argv = opt
        .usage('Prepare & publish tools RC to NPM under rc tag. \n' +
               'Cordova platform add uses latest tags from platforms. \n' +
               'Usage: $0 prepare-tools-release --jira CB-7904'
        )
        .options('jira', {
            desc: 'Release issue in JIRA'
        })
        .argv;    

    if(argv.h) {
        optimist.showHelp();
        process.exit(1);
    }

    //Update Repos
    yield repoupdate.updateRepos(tools);

    //remove local changes and sync up with remote master
    yield repoutil.forEachRepo(tools, function*() {
        yield gitutil.gitClean();
        yield gitutil.resetFromOrigin();
    });
    
    //get latest npm tags for platforms
    var TagsJSON = yield retrieveplatforms.retrieveTags(platforms);
    
    //Update platform references at cordova-lib/src/cordova/platformsConfig.json
    yield versionutil.updatePlatformsConfig(TagsJSON);

/*
    var cordovaLibVersion;
    //update package.json version for cli + lib, update lib reference for cli
    yield repoutil.forEachRepo([cordovaLib, cli], function*(repo) {
        var dir = process.cwd(); 
        var packageJSON = require(dir+'/package.json');
        packageJSON.version = versionutil.removeDev(packageJSON.version) + nightlyVersion;

        if(repo.id === 'lib'){
            cordovaLibVersion = packageJSON.version;
        } else {
            packageJSON.dependencies['cordova-lib'] = cordovaLibVersion;
        }

        fs.writeFileSync(dir+'/package.json', JSON.stringify(packageJSON, null, 4), 'utf8', function(err) {
            if (err) return console.log (err);
        });
    });

    //npm link repos that should be linked
    yield npmlink();

    //run CLI + cordova-lib tests
    yield runTests(cli, cordovaLib);
    */
}

exports.prepareToolsRelease = prepareToolsRelease;

function *runTests(cli, lib) {
    yield repoutil.forEachRepo([cli, lib], function *(repo) {
           yield executil.execHelper(executil.ARGS('npm test'), false, false);
    });
}
