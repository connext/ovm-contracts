"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function splitParams(id, spec) {
    return id.split(spec.parameters.delimiter);
}
exports.splitParams = splitParams;
function getParams(id, spec) {
    const arr = splitParams(id, spec);
    const params = {};
    arr.forEach((value, index) => {
        params[spec.parameters.values[index].name] = value;
    });
    return params;
}
exports.getParams = getParams;
function joinParams(params, spec) {
    return Object.values(spec.parameters.values)
        .map(parameter => {
        const param = params[parameter.name];
        return typeof param === "string"
            ? param
            : joinParams(param, parameter);
    })
        .join(spec.parameters.delimiter);
}
exports.joinParams = joinParams;
function isValidId(id, spec) {
    if (!new RegExp(spec.regex).test(id))
        return false;
    const params = splitParams(id, spec);
    if (params.length !== Object.keys(spec.parameters.values).length)
        return false;
    const matches = params
        .map((param, index) => new RegExp(spec.parameters.values[index].regex).test(param))
        .filter(x => !!x);
    if (matches.length !== params.length)
        return false;
    return true;
}
exports.isValidId = isValidId;
//# sourceMappingURL=utils.js.map