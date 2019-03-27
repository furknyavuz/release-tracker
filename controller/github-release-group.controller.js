const GitHubReleaseGroupModel = require('../model/github-release-group.model');

exports.insert = (req, res) => {
    GitHubReleaseGroupModel.createGitHubReleaseGroup(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 1000 ? parseInt(req.query.limit) : 1000;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    GitHubReleaseGroupModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.patchById = (req, res) => {

    GitHubReleaseGroupModel.patchGitHubReleaseGroup(req.params.gitHubReleaseGroupId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

