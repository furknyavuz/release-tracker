const GitHubReleaseModel = require('../models/github-release.model');
const request = require('request');

const GITHUB_API = 'https://api.github.com/graphql';

latestRelease = function (owner, name, token) {
    const query = '{ \"query\": \"query { repository(owner:\\\"' + owner + '\\\", name:\\\"' + name + '\\\") { releases(first:1, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { createdAt resourcePath tagName } } } }\" }';

    request.post({
        headers: {'User-Agent': 'Release Tracker', 'Authorization': `Bearer ${token}`},
        url: GITHUB_API,
        body: query
    }, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        const bodyJson = JSON.parse(body);

        const gitHubReleaseData = {
            owner: owner,
            name: name,
            createdAt: bodyJson.data.repository.releases.nodes[0].createdAt,
            resourcePath: bodyJson.data.repository.releases.nodes[0].resourcePath,
            tagName: bodyJson.data.repository.releases.nodes[0].tagName
        };

        GitHubReleaseModel.findByOwnerAndName(owner, name)
            .then((oldGitHubRelease) => {
                if (!oldGitHubRelease[0]) {
                    GitHubReleaseModel.createGitHubRelease(gitHubReleaseData);
                } else {
                    GitHubReleaseModel.patchGitHubRelease(oldGitHubRelease[0].id, gitHubReleaseData);
                }
            });
    });
};

exports.update = function () {
    return (req, res, next) => {
        latestRelease('bitcoin', 'bitcoin', '12116601fe51998baa865e75f335e315e658613a');
        latestRelease('facebook', 'react', '12116601fe51998baa865e75f335e315e658613a');

        return next();
    };
}
