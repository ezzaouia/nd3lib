import { module } from 'angular';

import AppTheme from './app.theme';
import AppRoutes from './app.routes';

import HomeComponent from './home/home.component';

export default module('app', [
    'ngMaterial',
    'angular-logger',
    'pascalprecht.translate',

    AppTheme.name,
    AppRoutes.name,

    HomeComponent.name,

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
