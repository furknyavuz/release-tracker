const GitHubController = require('../github-releases/controllers/github-release.controller');
const CronJob = require('cron').CronJob;

function gitHubReleasesUpdate() {
    GitHubController.update();
}

exports.startCronJobs = function () {
    new CronJob('* * * * *', function () {
        gitHubReleasesUpdate();
    }, null, true, 'UTC');
};
