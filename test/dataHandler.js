import assert from 'assert';
import expect from 'expect.js';
import _ from 'lodash';
import dataHandler from '../src/modules/dataHandler';

let dh = dataHandler();
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

describe('dataHandler', () => {
    describe('grid size', () => {
        it('should return the grid height',  () => assert.equal(dh.gridWidth(sampleData), 100));
        it('should return the grid height',  () => assert.equal(dh.gridHeight(sampleData), 100));
    });
    describe('dronesNum', () => {
        it('should return the drones number',  () => assert.equal(dh.dronesNum(sampleData), 3));
    });
    describe('turnsNum', () => {
        it('should return the number of turns',  () => assert.equal(dh.turnsNum(sampleData), 50));
    });
    describe('maxPayload', () => {
        it('should return the max payload',  () => assert.equal(dh.maxPayload(sampleData), 500));
    });
    describe('productTypeNum', () => {
        it('should return the number of product types',  () => assert.equal(dh.productTypeNum(sampleData), 3));
    });
    describe('productTypeList', () => {
        it('should return the product type list',  () => expect(dh.productTypeList(sampleData)).to.eql([100, 5, 450]));
    });

    describe('warehouses', () => {
        describe('warehousesNum', () => {
            it('should return the warehouses',  () => expect(dh.warehousesNum(sampleData)).to.eql(2));
        });
        describe('warehousesList', () => {
            it('should return the warehouses list',  () => expect(dh.warehousesList(sampleData)).to.eql(whExpectedList));
        });
        describe('warehousePos', () => {
            it('should return the warehouse position',  () => {
                expect(dh.warehousePos(whExpectedList[0])).to.eql([0, 0]);
                expect(dh.warehousePos(whExpectedList[1])).to.eql([5, 5]);
            });
        });
        describe('warehouseInventory', () => {
            it('should return the warehouse inventory',  () => {
                expect(dh.warehouseInventory(whExpectedList[0])).to.eql([5, 1, 0]);
                expect(dh.warehouseInventory(whExpectedList[1])).to.eql([0, 10, 2]);
            });
        });
    });

    describe('orders', () => {
        describe('ordersNum', () => {
            it('should return the order num',  () => expect(dh.ordersNum(sampleData)).to.eql(3));
        });
        describe('ordersList', () => {
            it('should return the orders list',  () => expect(dh.ordersList(sampleData)).to.eql(orExpectedList));
        });
        //describe('warehousePos', () => {
        //    it('should return the warehouse position',  () => {
        //        expect(dh.warehousePos(whExpectedList[0])).to.eql([0, 0]);
        //        expect(dh.warehousePos(whExpectedList[1])).to.eql([5, 5]);
        //    });
        //});
        //describe('warehouseInventory', () => {
        //    it('should return the warehouse inventory',  () => {
        //        expect(dh.warehouseInventory(whExpectedList[0])).to.eql([5, 1, 0]);
        //        expect(dh.warehouseInventory(whExpectedList[1])).to.eql([0, 10, 2]);
        //    });
        //});
    });

});
