window.fbAsyncInit = function() {
    debugger;
    FB.init(initParams || {status: true, xfbml: true});
    initialised = true;
    angular.forEach(queue, function(func) {
        func();
    });
};

