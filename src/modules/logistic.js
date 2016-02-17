import _ from 'lodash';

const logisticProvider = () => {
    //const { turns, orderList, droneList, warehouseList, productList } = startingData;
    const l = {};

    const command = (...args) => args;
    const loadCommand = (dr, wh, prType, prNum, ord) => command(dr, 'L', wh, prType, prNum, ord);
    const deliverCommand = (dr, or, prType, prNum) => command(dr, 'D', or, prType, prNum);

    const prodsWaiting = (orderProds) => _.first(orderProds);
    l.calcPayload = (prds, prdTypes) => prds.reduce((sum, p, i) => sum + (p * prdTypes[i]), 0);
    const canCarry = (prods, prdTypes, prd, maxPayload) => l.calcPayload(prods, prdTypes) + prdTypes[prd] <= maxPayload;
    const nextProd = (prods) => prods.reduce((a, c, i) => (_.isNull(a) && c !== 0) ? i : a, null);

    const prodsEmpty = (ar) => !ar.some(n => n > 0 );

    const removeProd = (ar, idx) => ar.map((e, i) => (i === idx) ? e - 1 : e);
    const addProd = (ar, idx) => ar.map((e, i) => (i === idx) ? e + 1 : e);

    const loadAll = (prods, idx, prodTypes, maxPayload, loaded) => {
        // todo should handle multiple products type from the same order
        if (!loaded) {
            loaded = Array(prods.length).fill(0);
        }
        if (prods[idx] === 0 || !canCarry(loaded, prodTypes, idx, maxPayload)) {
            return loaded;
        }

        return loadAll(removeProd(prods, idx), idx, prodTypes, maxPayload, addProd(loaded, idx));
    };

    const loadRec = (prods, prdTypes, prodsToLoad, maxPayload) => {
        if (prodsEmpty(prodsToLoad) || !canCarry(prods, prdTypes, _.first(prodsToLoad), maxPayload)) {
            return prods;
        } else {
            let prod = null;
            const prodsToLoadUpd = prodsToLoad.map(n => {});
            const newprods = prods.concat([prd]);
            const newprodsToLoad = _.pull(prodsToLoad, prd);
            return loadRec(newprods, prdTypes, newprodsToLoad, maxPayload);
        }
    };

    l.pickOrder = (orders, drones, productList, maxPayload) => {
        const validOrders = orders.filter(o => {
            if (prodsEmpty(_.first(o.prods))) return false;

            return drones.some(d => {
                return d.busy === 0 && _.first(o.prods).some((n, i) => canCarry(d.prods, productList, i, maxPayload));
            });
            //console.log();

        });

        return _.first(validOrders);
    };

    l.pickProduct = nextProd;
    l.pickDrone = (drones, productList, productType, maxPayload) => {
        const validDrones = drones.filter(d => canCarry(d.prods, productList, productType, maxPayload));
        return _.first(validDrones);
    };

    l.pickWarehouse = (warehouses, prod) => {
        const validWh = warehouses.filter(w => w.prods[prod] > 0);
        return _.first(validWh);
    };

    l.distance = (p1, p2) => Math.ceil(Math.sqrt(Math.pow(p1[0] - p2[0], 2) * Math.pow(p1[1] - p2[1], 2)));

    const moveToGroup = (prods, index, num, from, to) => {
        const res = prods[from].map((p, i) => (i === index) ? p - num : p);
        const toRes = prods[to].map((p = 0, i) => (i === index) ? p + num : p);
        return prods.map((a, i) => (i === from) ? res : (i === to) ? toRes : a);
    };

    l.moveProdToDelivering = (prods, index, num) => moveToGroup(prods, index, num, 0, 1);
    l.moveProdToInTransit = (prods, index, num) => moveToGroup(prods, index, num, 1, 2);

    l.loadFase = (orderList, droneList, warehouseList, productList, maxPayload, commands = []) => {
        const d = Date.now();
        const order = l.pickOrder(orderList, droneList, productList, maxPayload);
        console.log('pickorder in ' + (Date.now() - d));
        if (!order) {
            return commands;
        }

        const prdToLoad = prodsWaiting(order.prods);
        const prod = l.pickProduct(prdToLoad);
        if (_.isNull(prod)) {
            return commands;
        }

        const drone = l.pickDrone(droneList,productList, prod, maxPayload);
        if (!drone) {
            return commands;
        }
        const warehouse = l.pickWarehouse(warehouseList, prod);

        if (!warehouse) {
            return commands;
        }

        const load = loadAll(prdToLoad, prod, productList, maxPayload);
        const items = load[prod];

        commands.push(loadCommand(drone.id, warehouse.id, prod, items, order.id));

        const movedProds = l.moveProdToDelivering(order.prods, prod, items);
        const updOrder = Object.assign({}, order, { prods: movedProds });
        const updWarehouse = l.updateWarehouse(warehouse, prod, items);

        //console.log('call ', Date.now() - d, orderList.length);
        return l.loadFase(
            orderList
                .map((e, i) => (i === +_.findKey(orderList, { id: order.id })) ? updOrder : e)
                .filter((e) => !prodsEmpty(e.prods[0])
                ),
            droneList.filter(d => d.id !== drone.id && drone.busy === 0),
            warehouseList.map((e, i) => (i === +_.findKey(warehouseList, { id: updWarehouse.id })) ? updWarehouse : e),
            productList,
            maxPayload,
            commands
        );
    };

    l.getDestinationOrder = (drone, orders) => {
        return _.first(orders.filter((f, o) => {
            return f.prods[1].some((n, p) => n > 0 && drone.prods[p] > 0)
        }));
    };

    l.getDeliverables = (drone, order) => {
        return Array(drone.prods.length).fill(0).map((e, i) => {
            return Math.min(drone.prods[i], order.prods[1][i]);
        });

    };

    l.deliverFase = (orderList, droneList, warehouseList) => {
        const readyToDeliver = droneList.filter(d => canDeliver(d, warehouseList));
        const commands = [];

        readyToDeliver.forEach(d => {
            const dest = l.getDestinationOrder(d, orderList);
            if (dest) {

                l.getDeliverables(d, dest).forEach((n, p) => {
                    if (n > 0) {
                        commands.push(deliverCommand(d.id, dest.id, p, n));
                    }
                });
            }
        });

        return commands;
    };

    const carrying = (drone) => !_.empty(drone.prods);
    const isBusy = (drone) => drone.busy > 0;
    const canDeliver = (drone, warehouses) => {
        return !isBusy(drone) && !prodsEmpty(drone.prods);
        //return !isBusy(drone) && warehouses.some(w => _.isEqual(w.pos, drone.pos) && !prodsEmpty(drone.prods));
    };

    l.updateWarehouse = (wh, prod, items) => {
        return Object.assign(
            {},
            wh,
            { prods: wh.prods.map((n, p) => (p === prod) ? n - items : n) }
        );
    };

    l.updateDroneLoad = (dr, prod, items) => {
        return Object.assign(
            {},
            dr,
            { prods: dr.prods.map((n, p) => (p === prod) ? n + items : n) }
        );
    };

    l.updateDroneDeliv = (dr, prod, items) => {
        return Object.assign(
            {},
            dr,
            { prods: dr.prods.map((n, p) => (p === prod) ? n - items : n) }
        );
    };

    l.updateOrderToDeliv = (or, prod, items) => {
        return Object.assign(
            {},
            or,
            { prods: l.moveProdToDelivering(or.prods, prod, items) }
        );
    };

    l.updateOrderInDeliv = (or, prod, items) => {
        return Object.assign(
            {},
            or,
            { prods: l.moveProdToInTransit(or.prods, prod, items) }
        );
    };

    return l;
};

export default  logisticProvider;