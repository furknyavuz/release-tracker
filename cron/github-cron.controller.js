const GitHubController = require('../github-releases/controllers/github.controller');
const CronJob = require('cron').CronJob;

function gitHubReleasesUpdate() {
    GitHubController.update();
}

exports.startCronJobs = function () {
    new CronJob('0 0 * * *', function () {
        gitHubReleasesUpdate();
    }, null, true, 'UTC');
};
