import assert from 'assert';
import expect from 'expect.js';
import _ from 'lodash';
import logisticHandler from '../src/modules/logistic';

let log = logisticHandler();
const sampleData = [ [ 100, 100, 3, 50, 500 ],
    [ 3 ],
    [ 100, 5, 450 ],
    [ 2 ],
    [ 0, 0 ],
    [ 5, 1, 0 ],
    [ 5, 5 ],
    [ 0, 10, 2 ],
    [ 3 ],
    [ 1, 1 ],
    [ 2 ],
    [ 2, 0 ],
    [ 3, 3 ],
    [ 3 ],
    [ 0, 0, 0 ],
    [ 5, 6 ],
    [ 1 ],
    [ 2 ],
    [ 0 ] ];
const whExpectedList = [
    [
        [0, 0],
        [5, 1, 0]
    ],
    [
        [5, 5],
        [0, 10, 2]
    ]
];
const orExpectedList = [
    [
        [1, 1],
        [2],
        [1, 0, 1]
    ],
    [
        [3, 3],
        [3],
        [3, 0, 0]
    ],
    [
        [5, 6],
        [1],
        [0, 0, 1]
    ],
];

describe('logisticHandler', () => {
    //describe('dronesNum', () => {
    //    it('should return the drones number',  () => assert.equal(dh.dronesNum(sampleData), 3));
    //});
});
