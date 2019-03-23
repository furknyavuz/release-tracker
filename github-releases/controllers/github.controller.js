const GitHubReleaseModel = require('../models/github-release.model');
const request = require('request');

const GITHUB_API = 'https://api.github.com/graphql';

exports.insert = (req, res) => {
    GitHubReleaseModel.createGitHubRelease(req.body)
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
    GitHubReleaseModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

latestRelease = function (owner, name, token) {
    console.log(`Getting latest release for: http://github.com/${owner}/${name}`);

    const query = `{ \"query\": \"query { repository(owner:\\\"${owner}\\\", name:\\\"${name}\\\") { homepageUrl description releases(first:1, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { createdAt resourcePath tagName } } watchers(first: 1) { totalCount } stargazers(first: 1) { totalCount } } }\" }`;

    request.post({
        headers: {'User-Agent': 'Release Tracker', 'Authorization': `Bearer ${token}`},
        url: GITHUB_API,
        body: query
    }, function (error, response, body) {
        const bodyJson = JSON.parse(body);

        let createdAt = '';
        let resourcePath = '';
        let tagName = '';
        let homepageUrl = '';
        let description = '';
        let watchersCount = 0;
        let stargazersCount = 0;

        if (bodyJson && bodyJson.data && bodyJson.data.repository && bodyJson.data.repository.releases
            && bodyJson.data.repository.releases.nodes
            && bodyJson.data.repository.releases.nodes.length > 0
            && bodyJson.data.repository.watchers
            && bodyJson.data.repository.stargazers) {
            createdAt = bodyJson.data.repository.releases.nodes[0].createdAt;
            resourcePath = bodyJson.data.repository.releases.nodes[0].resourcePath;
            tagName = bodyJson.data.repository.releases.nodes[0].tagName;
            homepageUrl = bodyJson.data.repository.homepageUrl;
            description = bodyJson.data.repository.description;
            watchersCount = bodyJson.data.repository.watchers.totalCount;
            stargazersCount = bodyJson.data.repository.stargazers.totalCount;
        }
        const gitHubReleaseData = {
            owner: owner,
            name: name,
            createdAt: createdAt,
            resourcePath: resourcePath,
            tagName: tagName,
            homepageUrl: homepageUrl,
            description: description,
            watchersCount: watchersCount,
            stargazersCount: stargazersCount
        };

        GitHubReleaseModel.findByOwnerAndName(owner, name)
            .then((oldGitHubRelease) => {
                if (!oldGitHubRelease[0]) {
                    GitHubReleaseModel.createGitHubRelease(gitHubReleaseData);
                } else {
                    GitHubReleaseModel.patchGitHubRelease(oldGitHubRelease[0].id, gitHubReleaseData);
                }
                console.log(`Got latest release for: http://github.com${gitHubReleaseData.resourcePath}`);
            });
    });
};

exports.update = () => {
    console.log('GitHub Releases Update Started');

    GitHubReleaseModel.count().then((count) => {
        console.log(`Number of repositories to update: ${count}`);

        const pageSize = 10;
        const numberOfPages = Math.ceil(count / pageSize);

        for (let i = 0; i < numberOfPages; ++i) {
            GitHubReleaseModel.list(pageSize, i)
                .then((result) => {
                    for (let j = 0; j < result.length; j++) {
                        latestRelease(result[j].owner, result[j].name, '12116601fe51998baa865e75f335e315e658613a');
                    }
                })
        }
    });
};
