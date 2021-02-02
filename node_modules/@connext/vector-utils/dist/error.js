"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAxiosError = void 0;
exports.logAxiosError = (logger, error, additionalContext = {}, message = "Error sending request") => {
    let errorObj = {};
    if (error.response) {
        errorObj = { data: error.response.data, status: error.response.status, headers: error.response.headers };
    }
    else if (error.request) {
        errorObj = { request: "Error in request" };
    }
    else {
        errorObj = { message: error.message };
    }
    logger.error(Object.assign(Object.assign(Object.assign({}, errorObj), additionalContext), { config: error.config }), message);
};
//# sourceMappingURL=error.js.map