import fs from 'fs';
import _ from 'lodash';

const ioHandler = () => {
    const io = {};

    const loadFile = (path) => fs.readFileSync(path, 'utf8');
    const splitFile = (content, separator = '\n') => content.split(separator);
    const joinFile = (content, separator = '\n') => content.join(separator);

    io.import = _.flow(
        loadFile,
        (c) => splitFile(c),
        (a) => a.map(r => splitFile(r, ' ').map(Number))
    );

    io.generateFile = (path) => {
        fs.writeFile(path, '', 'utf8');
    };

    io.append = (path, data) => {
        fs.appendFileSync(path, data.map((r) => r.join(' ')).concat(['']).join('\n'));
    };

    return io;
};

export default ioHandler;