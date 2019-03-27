const GitHubReleaseModel = require('../model/github-release.model');
const Axios = require('axios');
const Config = require('../config/env.config');

const GITHUB_API = Config.githubEndpoint;

exports.insert = (req, res) => {
    GitHubReleaseModel.createGitHubRelease(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};

exports.groupList = (req, res) => {
    GitHubReleaseModel.groupList()
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.listByGroup = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 1000 ? parseInt(req.query.limit) : 1000;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    GitHubReleaseModel.listByGroup(limit, page, req.query.group)
        .then((result) => {
            res.status(200).send(result);
        })
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

exports.patchById = (req, res) => {

    GitHubReleaseModel.patchGitHubRelease(req.params.gitHubReleaseId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

async function updateDatabase(responseData, owner, name) {

    let createdAt = '';
    let resourcePath = '';
    let tagName = '';
    let releaseDescription = '';
    let homepageUrl = '';
    let description = '';
    let watchersCount = 0;
    let stargazersCount = 0;
    let avatarUrl = '';
    let topics = [];

    if (responseData.data.repository.releases
        && responseData.data.repository.releases.nodes
        && responseData.data.repository.releases.nodes.length > 0) {

        createdAt = responseData.data.repository.releases.nodes[0].createdAt;
        resourcePath = responseData.data.repository.releases.nodes[0].resourcePath;
        tagName = responseData.data.repository.releases.nodes[0].tagName;
        releaseDescription = responseData.data.repository.releases.nodes[0].description;
        homepageUrl = responseData.data.repository.homepageUrl;
        description = responseData.data.repository.description;
        topics = responseData.data.repository.repositoryTopics.nodes;

        if (responseData.data.organization && responseData.data.organization.avatarUrl) {
            avatarUrl = responseData.data.organization.avatarUrl;
        } else if (responseData.data.user && responseData.data.user.avatarUrl) {
            avatarUrl = responseData.data.user.avatarUrl;
        }
        const gitHubReleaseData = {
            owner: owner,
            name: name,
            createdAt: createdAt,
            resourcePath: resourcePath,
            tagName: tagName,
            releaseDescription: releaseDescription,
            homepageUrl: homepageUrl,
            description: description,
            avatarUrl: avatarUrl,
            topics: topics
        };

        await GitHubReleaseModel.findByOwnerAndName(owner, name)
            .then((oldGitHubRelease) => {
                if (!oldGitHubRelease[0]) {
                    GitHubReleaseModel.createGitHubRelease(gitHubReleaseData);
                } else {
                    GitHubReleaseModel.patchGitHubRelease(oldGitHubRelease[0].id, gitHubReleaseData);
                }
                console.log(`Got latest release for: http://github.com${gitHubReleaseData.resourcePath}`);
            });
    }
}

async function getLatestRelease(release) {

    const owner = release.owner;
    const name = release.name;
    const token = '2fa1cce9d1485592425ef9297e93a2f1d4ce7b24';

    console.log(`Getting latest release for: http://github.com/${owner}/${name}`);

    const query = `
          query {
            organization(login: "${owner}") {
                avatarUrl
            }
            user(login: "${owner}") {
                avatarUrl
            }
            repository(owner: "${owner}", name: "${name}") {
                releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                    nodes {
                        createdAt
                        resourcePath
                        tagName
                        description
                    }
                }
                repositoryTopics(first:100) {
                    nodes {
                        topic {
                            name
                        }
                    }
                }
            }
          }`;

    const buildQuery = JSON.stringify({query});

    const headers = {
        'User-Agent': 'Release Tracker',
        'Authorization': `Bearer ${token}`
    };

    await Axios.post(GITHUB_API, buildQuery, {headers: headers}
    ).then((response) => {
        return updateDatabase(response.data, owner, name);
    }).catch((error) => {
    });
}

async function asyncUpdate() {

    await GitHubReleaseModel.list().then((array) => {
        const promises = array.map(getLatestRelease);

        return Promise.all(promises);
    });
}

exports.update = async function update() {
    console.log('GitHub Releases Update Started');

    await asyncUpdate().then(() => {
        console.log('GitHub Releases Update Ended');
    });
};
