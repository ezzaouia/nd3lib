import { module } from 'angular';

function routeConfig ($urlRouterProvider, $stateProvider, $locationProvider) {
  'ngInject';

  $stateProvider

    .state('home', {
      url: '/',
      component: 'home',
    });

  $urlRouterProvider.otherwise('/');

}

export default module('nd3lib.routes', ['ui.router'])
  .config(routeConfig);
