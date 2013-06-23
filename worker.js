#! /usr/bin/env node

var environments = ['development','staging','production'],
    childProcess = require('child_process'),
    childProcesses = [];

environments.forEach(function(env){
	childProcesses.push(childProcess.spawn('./worker-process.js', [env], { stdio : "inherit"}));
});


process.on('exit', function() {
    console.log('About to exit.');

    childProcesses.forEach(function(childProc){
        childProc.kill();
    });

    console.log('Killed all child processes.');
});