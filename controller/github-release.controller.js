const GitHubReleaseModel = require('../model/github-release.model');
const Axios = require('axios');
const Config = require('../config/env.config');

const GITHUB_API = Config.githubEndpoint;
const GITHUB_ACCESS_TOKEN = Config.githubAccessToken;

exports.insert = (req, res) => {
    GitHubReleaseModel.createGitHubRelease(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};

exports.listByGroup = (req, res) => {

    GitHubReleaseModel.listByGroup(req.query.group)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.list = (req, res) => {

    GitHubReleaseModel.list()
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
    let repositoryDescription = '';
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
        repositoryDescription = responseData.data.repository.description;
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
            repositoryDescription: repositoryDescription,
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
                console.log(`Updated latest release: http://github.com${gitHubReleaseData.resourcePath}`);
            });
    }
}

async function getLatestRelease(repository) {

    const owner = repository.owner;
    const name = repository.name;
    const token = GITHUB_ACCESS_TOKEN;

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
                homepageUrl
                description 
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
