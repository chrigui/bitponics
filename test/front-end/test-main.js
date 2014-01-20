var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/Spec\.js$/).test(file);
});

requirejs.onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/public/',
    paths: {
        'angularMocks': './assets/js/libs/angular/1.2.0/angular-mocks.js',
        'angular': './assets/js/libs/angular/1.2.0/angular.min.js?v=1383102804480',
        'angular-flexslider' : './assets/js/libs/angular-flexslider.js?v=1383102804480',
        'angular-mask' : './assets/js/libs/angular/mask.js?v=1383102804480',
        'angularDialog' : './assets/js/libs/angular/ngDialog.js?v=1383102804480',
        'angularResource' : './assets/js/libs/angular/1.2.0/angular-resource.min.js?v=1383102804480',
        'angularRoute' : './assets/js/libs/angular/1.2.0/angular-route.min.js?v=1383102804480',
        'angularUI' : './assets/js/libs/angular/angular-ui.min.js?v=1383102804480',
        'angularUIBootstrap' : './assets/js/libs/angular/ui-bootstrap-0.5.0.min.js?v=1383102804480',
        'angularUISelect2' : './assets/js/libs/angular/angular-ui-select2.js?v=1383102804480',
        'bpn' : './assets/js/core/bpn.js?v=1383102804480',
        'bpn.controllers' : './assets/js/core/controllers.js?v=1383102804480',
        'bpn.controllers.nav' : './assets/js/controllers/nav.js?v=1383102804480',
        'bpn.directives' : './assets/js/core/directives.js?v=1383102804480',
        'bpn.directives.graphs' : './assets/js/directives/graphs.js?v=1383102804480',
        'bpn.filters' : './assets/js/core/filters.js?v=1383102804480',
        'bpn.services' : './assets/js/core/services.js?v=1383102804480',
        'bpn.services.analytics' : './assets/js/services/analytics.js?v=1383102804480',
        'bpn.services.device' : './assets/js/services/device.js?v=1383102804480',
        'bpn.services.garden' : './assets/js/services/garden.js?v=1383102804480',
        'bpn.services.growPlan' : './assets/js/services/grow-plan.js?v=1383102804480',
        'bpn.services.nav' : './assets/js/services/nav.js?v=1383102804480',
        'bpn.services.socket' : './assets/js/services/socket.js?v=1383102804480',
        'd3' : './assets/js/libs/d3.v2.js?v=1383102804480',
        'domReady': './assets/js/libs/requirejs/domReady.js?v=1383102804480',
        'es5shim': './assets/js/libs/es5-shim.min.js?v=1383102804480',
        'flexslider': './assets/js/libs/flexslider/jquery.flexslider-min.js?v=1383102804480',
        'fe-be-utils': './assets/js/fe-be/fe-be-utils.js?v=1383102804480',
        'jquery' : './assets/js/libs/jquery-1.8.2.min.js?v=1383102804480',
        'localscroll': './assets/js/libs/jquery/jquery.localScroll.min.js?v=1383102804480',
        'lvl.services.fileUploader': './assets/js/libs/angular/lvl-xhr-post.js?v=1383102804480',
        'lvl.services.uuid': './assets/js/libs/angular/lvl-uuid.js?v=1383102804480',
        'lvl.directives.fileUpload': './assets/js/libs/angular/lvl-file-upload.js?v=1383102804480',
        'moment': './assets/js/libs/moment.min.js?v=1383102804480',
        'overlay': './assets/js/shared/overlay.js?v=1383102804480',
        'scrollto': './assets/js/libs/jquery/jquery.scrollTo.min.js?v=1383102804480',
        'select2' : './assets/js/libs/jquery/select2.min.js?v=1383102804480',
        'selection-overlay' : './assets/js/controllers/selection-overlay.js?v=1383102804480',
        'socket.io' : '/socket.io/socket.io',
        'spin' : './assets/js/libs/spin.min',
        'steps': './assets/js/libs/Steps.js?v=1383102804480',
        'throttle-debounce': './assets/js/libs/jquery/jquery.ba-throttle-debounce.min.js?v=1383102804480',
        'utils': './assets/js/shared/utils.js?v=1383102804480',
        'view-models': './assets/js/fe-be/view-models.js?v=1383102804480'
    },
    shim: { 
        // 'setup/grow-plan': {
        //     deps: ['angular', 'angularResource', 'jquery'],
        //     exports: 'setupGrowPlanApp'
        // },
        'angularResource': {
            deps: ['angular'],
            exports: 'angularResource'
        },
        'angularMocks': {
            deps: ['angularResource'],
            exports: 'angularMocks'
        },
        'angular': { 
            deps: [ ], 
            exports: 'angular' 
        }, 
        'angularDialog': { 
            deps: [ 'angular' ] 
        },
        'angularRoute': { 
            deps: [ 'angular' ] 
        },
        'angularUISelect2': {
            deps: [ 'angular', 'select2' ] 
        },
        'angularUI': { 
            deps: [ 'angular' ] 
        },
        'angularUIBootstrap': { 
            deps: [ 'angular' ] 
        },
        'd3' : {
            exports : 'd3'
        },
        'jquery': { 
            exports : '$'
        },
        'socket.io': {
            exports: 'io'
        },
        'spin' : {
            exports : "Spinner"
        },
        'flexslider' : {
            deps: ['jquery']
        },
        'angular-flexslider' : {
            deps: ['angular', 'flexslider']
        },
        'throttle-debounce' : {
            deps: ['jquery']
        },
        'localscroll' : {
            deps: ['jquery']
        },
        'scrollto' : {
            deps: ['jquery']
        },
        'selection-overlay' : {
            deps: ['angular']
        },
        'angular-mask' : {
            deps: ['angular']
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,
    // start test run, once Require.js is done
    callback: window.__karma__.start
});