// @ts-ignore
global.self = {};
// @ts-ignore
global.atob = (str) => {
    return Buffer.from(str, 'base64').toString('utf-8');
};
// @ts-ignore
global.performance = require('perf_hooks').performance;
//# sourceMappingURL=globals.js.map