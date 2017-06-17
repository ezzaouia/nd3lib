import { module } from 'angular';
import * as d3 from 'd3';
import * as _ from 'lodash';
// import textures from 'textures';

import template from './line-chart.directive.html';
import visugUITemplate from './visug-ui.tmpl.html';
import './line-chart.directive.scss';

/* global
    angular, document
*/

_.mixin({
    'project': (object, path, key) => {
        return _.map(_.get(object, path), key);
    },
});

function LineChartController ($timeout, $window, $log, $mdDialog) {
    let lineChart = this;

    lineChart.$timeout = $timeout;
    lineChart.$window = $window;
    lineChart.$log = $log;
    lineChart.$mdDialog = $mdDialog;
    lineChart.visug = true;

    lineChart.rootDiv = d3.select('#nd3lib-line-chart');
    lineChart.width = lineChart.rootDiv.node().offsetWidth || $window.innerWidth;
    lineChart.height = _.get('options', 'height', 300);
    lineChart.margin = _.get('options', 'margin', {
        top: 10,
        bottom: 30,
        left: 30,
        right: 10,
    });

    // TO-REMOVE
    lineChart.data = {
        //line1: Array.from({ lenght: 6 }, () => Math.floor(Math.random() * 99))
        dataset0: [
            { x: 0, val_0: 0, val_1: 0, val_2: 0, val_3: 0, color: '#005b9d' },
            { x: 1, val_0: 0.993, val_1: 3.894, val_2: 8.47, val_3: 14.347, color: '#005b9d' },
            { x: 2, val_0: 1.947, val_1: 7.174, val_2: 13.981, val_3: 19.991, color: '#005b9d' },
            { x: 3, val_0: 2.823, val_1: 9.32, val_2: 14.608, val_3: 13.509, color: '#005b9d' },
            { x: 4, val_0: 3.587, val_1: 9.996, val_2: 10.132, val_3: -1.167, color: '#005b9d' },
            { x: 5, val_0: 4.207, val_1: 9.093, val_2: 2.117, val_3: -15.136, color: '#005b9d' },
            { x: 6, val_0: 4.66, val_1: 6.755, val_2: -6.638, val_3: -19.923, color: '#005b9d' },
            { x: 7, val_0: 5, val_1: 3.35, val_2: -13.074, val_3: -12.625, color: '#005b9d' },
        ],
        dataset1: [
            { x: 0, val_4: 0, val_5: 0, val_6: 0, val_7: 0, color: '#005b9d' },
            { x: 1, val_4: 0.993, val_5: 3.894, val_6: 8.47, val_7: 14.347, color: '#005b9d' },
            { x: 2, val_4: 1.947, val_5: 7.174, val_6: 13.981, val_7: 19.991, color: '#005b9d' },
        ],
    };

    lineChart.visugConfig = {
        yaxis: [],
    };

    lineChart.options = {
        yaxis: [
            {
                dataset: 'dataset0',
                key: 'val_0',
                color: [
                    'green',
                    {
                        key: 'color',
                    },
                ],
                symbol: ['line', 'dot'], // default is line if nothing is specified
            },
            {
                dataset: 'dataset0',
                key: 'val_1',
                color: '#cc77aa',
                symbol: [
                    'line',
                    {
                        type: 'path', d: d3.symbol().size(200).type(d3.symbolCircle),
                    },
                ],
            },
            {
                dataset: 'dataset0',
                key: 'val_3',
                color: '#f19b6f',
                symbol: ['line', 'dot'],
            },
        ],
        xaxis: //[
        {
            dataset: 'dataset0',
            key: 'x',
        },
        //],
    };

    lineChart.dataArray = _.project(lineChart, 'data.dataset0', 'val_0');
    lineChart.dataMax = _.max(lineChart.dataArray);
    lineChart.dataMin = _.min(lineChart.dataArray);

    lineChart.xScaleLinear = d3.scaleLinear().clamp(true);
    lineChart.yScaleLinear = d3.scaleLinear().clamp(true);
    lineChart.d3Line = d3.line();

    // once ready => draw chart
    lineChart.ready();
}

LineChartController.prototype.ready = function () {
    let lineChart = this;

    angular.element(document).ready(readyCb);

    function readyCb () {
        if (!lineChart.rootDiv.node().offsetWidth || lineChart.rootDiv.node().offsetWidth <= 0) {
            // Let's try again next time
            lineChart.$timeout(lineChart.ready());
            return;
        }

        // update the width
        lineChart.width = lineChart.rootDiv.node().offsetWidth || lineChart.$window.innerWidth;

        lineChart.xScaleLinear.range([0, lineChart.width - lineChart.margin.right - lineChart.margin.left]);
        lineChart.yScaleLinear.range([lineChart.height - lineChart.margin.bottom, 0]);

        lineChart.drawSvg();
        lineChart.drawData();
        lineChart.drawXAxis();
        lineChart.drawYAxis();

        if (lineChart.visug) {
            lineChart.buildVisug();
            lineChart.$log.debug('visugData ===> ', lineChart.visugData);
        }
    }
};

/**
 * append the main svg for the chart
 */
LineChartController.prototype.drawSvg = function () {
    let lineChart = this;

    lineChart.svg = lineChart.rootDiv
        .select('#nd3lib-line-chart-svg')
        .append('svg')
        .attr('width', lineChart.width)
        .attr('height', lineChart.height)
        .append('g')
        .classed('g-nd3lib-line-chart', true)
        .attr('transform', `translate(${lineChart.margin.left}, ${lineChart.margin.top})`);
};

LineChartController.prototype.drawXAxis = function () {
    let lineChart = this;
    lineChart.svg.append('g')
        .attr('transform', `translate(${0}, ${lineChart.height - lineChart.margin.bottom})`)
        .classed('g-nd3lib-line-xaxis', true)
        .call(d3.axisBottom(lineChart.xScaleLinear));
};

LineChartController.prototype.drawYAxis = function () {
    let lineChart = this;
    lineChart.svg.append('g')
        .attr('transform', `translate(${0}, ${0})`)
        .classed('g-nd3lib-line-xaxis', true)
        .call(d3.axisLeft(lineChart.yScaleLinear));
};

LineChartController.prototype.drawData = function () {
    let lineChart = this;
    let datasetsDatum = {};
    let yaxis = _.get(lineChart, 'options.yaxis');
    if (!_.isArray(yaxis)) {
        yaxis = [yaxis];
    }

    lineChart.xScaleLinear.domain(lineChart.getXAxisExtent());
    lineChart.yScaleLinear.domain(lineChart.getYAxisExtent());

    _.each(yaxis, (item, index) => {

        let yKey = item.key;
        let colorz = item.color || '#000';
        let symbolz = item.symbol || [];

        let dataset = _.get(lineChart, `data.${item.dataset}`);
        let xKey = _.get(lineChart, `options.xaxis[${index}].key`);

        if (!dataset || !yKey) { return false; }

        lineChart.d3Line
            .y((d, i) => lineChart.yScaleLinear(d[yKey]))
            .x((d, i) => lineChart.xScaleLinear(xKey ? d[xKey] : i));

        // draw
        if (symbolz) {
            let type, dAttr, clazz;
            let color = (typeof colorz === 'string') ? colorz : null;

            if (!_.isArray(symbolz)) { symbolz = [symbolz]; }
            _.each(symbolz, (symbol, symbolIndex) => {

                [type, dAttr] = (symbol instanceof Object) ? [symbol.type, symbol.d] : [symbol, null];
                clazz = `${item.dataset}-${type}-${index}`;

                datasetsDatum[clazz] = lineChart.svg.selectAll(`.${clazz}`);

                switch (type) {

                    case 'dot':
                        datasetsDatum[clazz]
                            .data(dataset)
                            .enter()
                            .append('path')
                            .classed(clazz, true)
                            .merge(datasetsDatum[clazz])
                            .attr('d', d3.symbol().size(100).type(d3.symbolCircle))
                            .style('fill', color || lineChart.getColor.bind(null, colorz, symbolIndex))
                            .style('stroke', 'none')
                            .attr('transform', (d, i) => `translate(${lineChart.xScaleLinear(xKey ? d[xKey] : i)}, ${lineChart.yScaleLinear(d[yKey])})`);
                        break;

                    case 'line':
                        datasetsDatum[clazz]
                            .data([dataset])
                            .enter()
                            .append('path')
                            .classed(clazz, true)
                            .merge(datasetsDatum[clazz])
                            .attr('d', lineChart.d3Line)
                            .style('fill', 'none')
                            .style('stroke', color || lineChart.getColor.bind(null, colorz, symbolIndex));
                        break;

                    case 'path':
                        datasetsDatum[clazz]
                            .data(dataset)
                            .enter()
                            .append('path')
                            .classed(clazz, true)
                            .merge(datasetsDatum[clazz])
                            .attr('d', dAttr || lineChart.d3Line)
                            .style('fill', color || lineChart.getColor.bind(null, colorz, symbolIndex))
                            .style('stroke', 'none')
                            .attr('transform', (d, i) => `translate(${lineChart.xScaleLinear(xKey ? d[xKey] : i)}, ${lineChart.yScaleLinear(d[yKey])})`);
                        break;

                    default:
                        break;
                }

                datasetsDatum[clazz].exit().remove();
            });
        }
    });
};

LineChartController.prototype.getColor = function (colorz, index, d, i) {

    if (!colorz || !colorz[index]) { return null; }

    if (_.isArray(colorz)) {

        if (_.isString(colorz[index])) {
            return colorz[index];
        }

        if (_.isObject(colorz[index])) {

            let key = _.get(colorz[index], 'key');
            let map = _.get(colorz[index], 'map');

            if (key || map) {
                return _.get(map, _.get(d, key));
            } else if (key) {
                return _.get(d, key);
            }
        }
    }
    return null;
};

/**
 * Get the max value for x axis (xamax), to be used
 * for xscale's domain
 * Regarding the config we can have:
 *  (0) no x axis at all => xamax = _.size(datasets..)
 *  (1) one x axis for all lines => Max(x_axis_array)
 *  (2) an x axis for each line => Max(x_axis_arrays..)
 *  (3) some x axis for some lines => xmax = Max(_.size(datasets..), Max(x_axis_arrays))
 */
LineChartController.prototype.getXAxisExtent = function () {
    let lineChart = this;
    let dataOpts = _.get(lineChart, 'options');
    let xaxis = _.get(dataOpts, 'xaxis');
    let yaxis = _.get(dataOpts, 'yaxis');
    let max = Number.NEGATIVE_INFINITY;
    let tmp = max;

    if (!_.isArray(yaxis)) {
        yaxis = [yaxis];
    }
    // case (0)
    if (!dataOpts || !dataOpts.hasOwnProperty('xaxis') || !xaxis) {
        lineChart.$log.debug('xamax case 0');
        if (!yaxis) { return 0; }
        _.each(yaxis, (item) => {
            tmp = _.size(_.get(lineChart, _.get(item, 'dataset')));
            if (tmp >= max) { max = tmp; }
        });
        return [0, max];
    }
    // case (1)
    if (_.isObject(xaxis) && xaxis.hasOwnProperty('dataset') && xaxis.hasOwnProperty('key')) {
        lineChart.$log.debug('xamax case 1');
        return [0, _.max(_.project(lineChart, `data.${_.get(xaxis, 'dataset')}`, _.get(xaxis, 'key')))];
    }
    // case (2)
    if (_.size(xaxis) === _.size(yaxis)) {
        lineChart.$log.debug('xamax case 2');
        _.each(xaxis, (item) => {
            tmp = _.max(_.project(lineChart, `data.${_.get(item, 'dataset')}`, _.get(item, 'key')));
            if (tmp >= max) { max = tmp; }
        });
        return [0, max];
    }
    // case (3)
    if (_.size(xaxis) !== _.size(yaxis)) {
        lineChart.$log.debug('xamax case 3');
        _.each(xaxis, (item) => {
            tmp = _.max(_.project(lineChart, `data.${_.get(item, 'dataset')}`, _.get(item, 'key')));
            if (tmp >= max) { max = tmp; }
        });
        _.each(yaxis, (item) => {
            tmp = _.size(_.get(lineChart, `data.${_.get(item, 'dataset')}`));
            if (tmp >= max) { max = tmp; }
        });
        return [0, max];
    }
};

LineChartController.prototype.getYAxisExtent = function () {
    let lineChart = this;
    let dataOpts = _.get(lineChart, 'options');
    let yaxis = _.get(dataOpts, 'yaxis');
    let max = Number.NEGATIVE_INFINITY, maxtmp = max, min = Number.POSITIVE_INFINITY, mintmp = min;
    if (!_.isArray(yaxis)) {
        yaxis = [yaxis];
    }
    _.each(yaxis, (item) => {
        [mintmp, maxtmp] = d3.extent(_.project(lineChart, `data.${_.get(item, 'dataset')}`, _.get(item, 'key')));
        if (maxtmp >= max) { max = maxtmp; }
        if (mintmp <= min) { min = mintmp; }
    });
    return [min, max];
};

LineChartController.prototype.buildVisug = function () {
    let lineChart = this;
    lineChart.visugUIData = {};
    _.each(_.get(lineChart, 'data'), (dataset, k) => {
        lineChart.visugUIData[k] = _.chain(dataset)
            .flatMap(item => _.keys(item))
            .uniq()
            .remove(item => item !== '$$hashKey') // we keep remaining elements  
            .value();
    });

    return lineChart.visugUIData;
};

LineChartController.prototype.openVisugUI = function (ev) {
    let lineChart = this;
    lineChart.$mdDialog.show({
        controller: function ($mdDialog) {
            let VisugUI = this;
            VisugUI.visugUIData = lineChart.visugUIData;
        },
        template: visugUITemplate,
        parent: angular.element(document.body),
        targetEvent: ev,
        controllerAs: 'VisugUI',
        clickOutsideToClose: true,
        // fullscreen: $scope.customFullscreen,
    }).then(function (answer) {
        // $scope.status = 'You said the information was "' + answer + '".';
    }, function () {
        // $scope.status = 'You cancelled the dialog.';
    });
};

function VisugUIController () {
}

const lineChart = {
    restricted: 'E',
    template,
    controller: LineChartController,
    controllerAs: 'lineChart',
    scope: {},
    bindToController: {
        options1: '=',
        data1: '=',
    },
};

export default module('nd3lib.lineChart', [])
    .directive('lineChart', function () {
        return lineChart;
    });
