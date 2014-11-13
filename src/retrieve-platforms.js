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

var repoutil = require('./repoutil');
var executil = require('./executil');
var flagutil = require('./flagutil');

function *retrieveShas(repos) {
    var shas = {};
    yield repoutil.forEachRepo(repos, function*(repo) {
        shas[repo.id] = yield executil.execHelper(executil.ARGS('git rev-parse HEAD'), true, true);
    });
    return shas;
}

exports.retrieveShas = retrieveShas;

function *retrieveTags(repos) {
    var tags = {};
    yield repoutil.forEachRepo(repos, function*(repo) {
        if(repo.id === 'blackberry') {
            tags[repo.id] = yield executil.execHelper(executil.ARGS('npm view ' + repo.repoName + '10 dist-tags.latest'), true, true); 
        } else {
            tags[repo.id] = yield executil.execHelper(executil.ARGS('npm view ' + repo.repoName + ' dist-tags.latest'), true, true); 
        }
    });
    return tags;
}

exports.retrieveTags = retrieveTags;
