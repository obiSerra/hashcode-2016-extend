import _ from 'lodash';

const dataHandler = () => {
    const d = {};

    const filterRows = (data, startingRow, endingRow) => data.filter((r, i) => i >= startingRow && i < endingRow);

    const mergeRows = (rows, groupSize) => {
        return rows.reduce((all, cur, idx) => {
            if (idx % groupSize === 0) {
                all.push([cur]);
            } else {
                _.last(all).push(cur);
            }
            return all;
        }, []);
    };

    const whStRow = () => 4;
    const whEdRow = (data) => whStRow() + d.warehousesNum(data) * 2;
    const getWhList  = (data) => filterRows(data, whStRow(), whEdRow(data));

    const orStNum = (data) => whEdRow(data) + 1;
    const orEdRow = (data) => orStNum(data) + d.ordersNum(data) * 3;
    const getOrList = (data) => filterRows(data, orStNum(data), orEdRow(data));

    const prToPrType = (pr, prTypeNum) => {
        return pr.reduce((all, curr) => {
            all[curr]++;
            return all;
        }, Array(prTypeNum).fill(0));
    };

    d.gridWidth = _.flow(_.head, _.head);
    d.gridHeight = _.flow(_.head, _.tail, _.head);
    d.dronesNum = _.flow(_.head, _.tail, _.tail, _.head);
    d.turnsNum = _.flow(_.head, _.tail, _.tail, _.tail, _.head);
    d.maxPayload = _.flow(_.head, _.tail, _.tail, _.tail, _.tail, _.head);
    d.productTypeNum = _.flow(_.tail, _.head, _.head);
    d.productTypeList = _.flow(_.tail, _.tail, _.head);
    // -- warehouses methods
    d.warehousesNum = _.flow(_.tail, _.tail,_.tail, _.head, _.head);
    d.warehousesList = (data) => mergeRows(getWhList(data), 2);
    d.warehousePos = _.head;
    d.warehouseInventory = _.last;
    // -- order methods
    d.ordersNum = (data) => _.first(data[whEdRow(data)]);
    d.ordersList = (data) => mergeRows(getOrList(data), 3)
        .map(or => _.concat(_.initial(or),[prToPrType(_.last(or), d.productTypeNum(data))]));

    return d;
};

export default dataHandler;