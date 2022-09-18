"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validatePayloadMiddleware(schema) {
    return (req, res, next) => {
        try {
            schema.parse({ body: req.body, query: req.query, params: req.params });
            next();
        }
        catch (error) {
            return res.status(400).json(JSON.parse(error)[0].message);
        }
    };
}
exports.default = validatePayloadMiddleware;
