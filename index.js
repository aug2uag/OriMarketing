#!/usr/bin/env node
/*
channel+ © 2015
*/

var cluster = require('cluster');
var CPUs = require('os').cpus().length;
var env = process.env;
var pid = process.pid;

var pibcorn = function(msg) {
  console.log(msg);
};

if (cluster.isMaster) {
  console.log('Master:', pid);
  cluster.schedulingPolicy = cluster.SCHED_NONE;
  for (var i = 1; i < CPUs; i++) {
    cluster.fork();
  }
  Object.keys(cluster.workers).forEach(function(id) {
    cluster.workers[id].on('message', pibcorn);
  });
  cluster.on('death', function(worker, code, signal) {
    console.error('Death:', worker.pid);
    cluster.fork();
  });
  cluster.on('exit', function(worker, code, signal) {
    console.error('Exit:', worker.pid);
    cluster.fork();
  });
  require('./worker.js');
} else {
  //console.log('Worker:', pid);
  require('./server.js');
}
