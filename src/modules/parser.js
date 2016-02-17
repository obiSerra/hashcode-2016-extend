import _ from 'lodash';

const parserProvider = () => {
    const p = {};

    const emptyList = (l) => Array(l).fill(0);

    const parseOrder = (id, data) => {
        return {
            id: id,
            pos: _.first(data),
            prods: [
                _.last(data),
                emptyList(_.last(data).length),
                emptyList(_.last(data).length),
                emptyList(_.last(data).length)
            ]
        };
    };

    const parseDrone = (id, pos, prodNum) => {
        return {
            id: id,
            pos: pos,
            prods: emptyList(prodNum),
            go: null,
            busy: 0
        };
    };

    const parseWarehouse = (id, data) => _.identity({ id: id, pos: _.first(data), prods: _.last(data)});

    p.parseOrders = (orderList) => orderList.map((el, i) => parseOrder(i, el));
    p.generateDroneList = (num, pos, prodNum) => Array(num).fill(null).map((u, i) => parseDrone(i, pos, prodNum));
    p.parseProds = (prodList) => prodList.map((w, i) => _.identity({ id: i, w: w }));
    p.parseWarehouses = (warehouseList) => warehouseList.map((d, i) => parseWarehouse(i, d));

    return p;
};

export default  parserProvider;