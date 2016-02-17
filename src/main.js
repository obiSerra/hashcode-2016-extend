let d = Date.now();

import _ from 'lodash';
import ioHandler from './modules/ioHandler';
import dataHandlerProvider from './modules/dataHandler';
import parserProvider from './modules/parser';
import logisticProvider from './modules/logistic';

const io = ioHandler();

const getArg = (argIdx, def) => (_.isEmpty(process.argv[argIdx])) ? def : process.argv[argIdx];

const fileIn = getArg(2, 'input.in');
const fileOut = getArg(3, 'test.out');
const ts = Date.now();
const pathIn = 'data/in/' + fileIn;
const pathOut = 'data/out/' + ts + '_' + fileOut;

const startingData = io.import(pathIn);
const dh = dataHandlerProvider();
const pr = parserProvider();

const orderList = _.flowRight(pr.parseOrders, dh.ordersList)(startingData);
let droneList = pr.generateDroneList(
    dh.dronesNum(startingData),
    _.flowRight(_.first, _.first, dh.warehousesList)(startingData),
    dh.productTypeNum(startingData)
);
const warehousesList = _.flowRight(pr.parseWarehouses, dh.warehousesList)(startingData);
const productList = dh.productTypeList(startingData);
const maxPayload = dh.maxPayload(startingData);

const lg = logisticProvider();

const totTurns = dh.turnsNum(startingData);
let turns = totTurns;

io.generateFile(pathOut);

console.log('Setup finished in ' + (Date.now() - d) + 'ms');
console.log(' ------ ');
while (turns--) {
    d = Date.now();
    let commands = [];
    let loadCommands = lg.loadFase(orderList, droneList, warehousesList, productList, maxPayload);
    // update state
    loadCommands = loadCommands.map(c => {
        const dr = _.findKey(droneList, { id: c[0] });
        const wh = _.findKey(warehousesList, { id: c[2] });
        const or = _.findKey(orderList, { id: c[5] });

        orderList[or] = lg.updateOrderToDeliv(orderList[or], c[3], c[4]);
        warehousesList[wh] = lg.updateWarehouse(warehousesList[wh], c[3], c[4]);
        droneList[dr] = lg.updateDroneLoad(droneList[dr], c[3], c[4]);

        /*
        console.log(
            'command ' + _.initial(c).join(' '),
            '| drone ' + droneList[dr].id,
            '| loaded ' + droneList[dr].prods,
            '| available payload ' + (maxPayload - lg.calcPayload(droneList[dr].prods, productList))
        );
        */

        droneList[dr].go = warehousesList[wh].pos;
        //console.log(droneList[dr].pos);
        droneList[dr].busy = Math.max(lg.distance(droneList[dr].pos, droneList[dr].go), 1);

        return _.initial(c);
    });

    const deliverCommands = lg.deliverFase(orderList, droneList, warehousesList);

    deliverCommands.forEach(c => {
        const dr = _.findKey(droneList, { id: c[0] });
        const or = _.findKey(orderList, { id: c[2] });

        orderList[or] = lg.updateOrderInDeliv(orderList[or], c[3], c[4]);
        droneList[dr] = lg.updateDroneDeliv(droneList[dr], c[3], c[4]);

        droneList[dr].go = orderList[or].pos;
        droneList[dr].busy = Math.max(lg.distance(droneList[dr].go, orderList[or].pos), 1);
    });

    commands = commands.concat(loadCommands, deliverCommands);

    droneList = droneList.map((d, i) => {
        const busy = Math.max(d.busy - 1, 0);
        return Object.assign({}, d, {
            busy: busy,
            pos: (busy === 0 && !_.isNull(d.go)) ? d.go : d.pos,
            go: (busy === 0 && _.isEqual(d.go, d.pos)) ? null : d.go
        });
    });

    //-console.log(orderList.forEach(o => console.log(o.id, o.prods[0], o.prods[1])));


    if (!_.isEmpty(commands)) {
        io.append(pathOut, commands);
    }
    console.log('End turn ' + (totTurns - turns) + ' of ' + totTurns, (Date.now() - d) + 'ms');
    //process.exit();
}