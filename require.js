var cache = {
  string: {
    
  }
}; 

function preload(names, callback, opt_index) {
  var index = opt_index ? opt_index : 0;
  if (index >= names.length) {
    window.console.log('preload: all done, calling callback.');
    callback();
    return;
  }
  var name = names[index];
  window.module = {exports: {}};
  window.exports = module.exports;
    
  window.console.log('preload: requesting: ' + name);
  var script = document.createElement('script');
  script.onload = function() {
    cache[name] = module.exports;
    preload(names, callback, index + 1);
  };
  script.src = name + ".js";
  document.getElementsByTagName('head')[0].appendChild(script);
}

function require(name) {
  var result = cache[name]; 
  if (!result) throw 'Not preloaded: "' + name + '"';
  return result;
}