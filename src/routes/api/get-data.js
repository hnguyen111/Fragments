const crypto = require("crypto");
const mimeTypes = require("mime-types");
const {Fragment} = require("../../model/fragment");
const {createErrorResponse} = require("../../response");

module.exports = async (req, res) => {
    const [id, extension] = req.params.id.split(".");
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    try {
        const fragment = await Fragment.byId(ownerId, id);
        if (!extension) {
            res.set("Content-Type", fragment.mimeType);
            res.status(200).send(await fragment.getData());
        }
        else {
            res.set("Content-Type", mimeTypes.lookup(extension));
            if (!fragment.isConvertible(extension)) {
                res.status(415)
                    .json(createErrorResponse(415, "The fragment can not be converted or the given extension is not supported"));
            }
            else {
                res.set("Content-Type", mimeTypes.lookup(extension));
                res.status(200).send(await fragment.getData());
            }
        }
    } catch (e) {
        res.status(404)
            .json(createErrorResponse(404, "The fragment can not be found"));
    }
};