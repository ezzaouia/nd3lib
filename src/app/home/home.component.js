import { module } from 'angular';

import template from './home.component.html';
import './home.component.scss';

function HomeController () {
}

const homeComponent = {
    restricted: 'E',
    template,
    controller: HomeController,
};

export default module('app.home', [])
    .component('home', homeComponent);
