import { module } from 'angular';

import AppTheme from './app.theme';
import AppRoutes from './app.routes';

import HomeComponent from './home/home.component';

import lineChart from './line-chart';

export default module('nd3lib', [
    'ngMaterial',
    'angular-logger',
    'pascalprecht.translate',

    AppTheme.name,
    AppRoutes.name,

    // just for testing
    HomeComponent.name,

    // chart lib components
    lineChart.name,

]).component('app', {
    template: '<md-content ng-cloak><div ui-view></div></md-content>',
    restrict: 'E',
}).config(['$translateProvider', function ($translateProvider) {
    const FILE_NAME_CONVENTION = {
        prefix: './assets/resources/i18n/locale-',
        suffix: '.json',
    };

    $translateProvider.useStaticFilesLoader(FILE_NAME_CONVENTION);
    $translateProvider.preferredLanguage('fr_FR');
}]);
