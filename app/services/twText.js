#!/usr/bin/env node
/*
channel+ © 2015
*/

// prepare single object
exports.processText = function(inputText, inputLink) {
  var str = inputText
  // filter out
  str = filterOut(str, 'a', '')
  str = filterOut(str, 'an', '')
  str = filterOut(str, 'one', '1')
  str = filterOut(str, 'two', '2')
  str = filterOut(str, 'three', '3')
  str = filterOut(str, 'four', '4')
  str = filterOut(str, 'five', '5')
  str = filterOut(str, 'six', '6')
  str = filterOut(str, 'seven', '7')
  str = filterOut(str, 'eight', '8')
  str = filterOut(str, 'nine', '9')
  str = filterOut(str, 'of', '')
  str = filterOut(str, 'in', '')
  str = filterOut(str, 'other', '')
  str = filterOut(str, 'more', '')
  str = filterOut(str, 'less', '')
  str = filterOut(str, 'must', '')
  str = filterOut(str, 'should', '')
  str = filterOut(str, 'almost', '')
  str = filterOut(str, 'or', '')
  str = filterOut(str, 'the', '')
  str = filterOut(str, 'if', '')
  str = filterOut(str, 'many', '')
  str = filterOut(str, 'most', '')
  str = filterOut(str, 'every', '')
  str = filterOut(str, 'each', '')
  str = filterOut(str, 'all', '')
  str = filterOut(str, 'some', '')
  str = filterOut(str, 'to', '')
  str = filterOut(str, 'are', '')
  str = filterOut(str, 'be', '')
  str = filterOut(str, 'for', '')
  str = filterOut(str, 'love', '')
  str = filterOut(str, 'and', '&')

  // eliminate whitespace
  str = str.trim().replace(/[^\w\s\+\/\:\.\@\#\!\'\"\&\%']/gi, '').replace(/\s{2,}/g, ' ');

  // capitalize
  str = str.split('. ')
  for (var i = 0; i < str.length; i++) {
    // console.log('before str[i] = ' + str[i])
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    // console.log('after str[i] = ' + str[i])
    // console.log(Array(20).join('- '))
  };
  str = str.join('. ')
  str = str.substr(0, 110)
  // console.log('final:\n' + str)
  // console.log(Array(40).join('='))
  // console.log('\n\n')

  // remove last word set
  str = str.split(' ')
  str.pop()
  str = str.join(' ').trim()
  // format with periods
  str += '..'

  return str
};

function filterOut(input, filt, replace) {
  var inputText = input.split(' ')
  for (var i = 0; i < inputText.length; i++) {
    if (inputText[i].toLowerCase() === filt) {
      inputText[i] = replace
    };
  };
  return inputText.join(' ')
};