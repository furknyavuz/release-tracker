const GitHubController = require('../controller/github-release.controller');
const CronJob = require('cron').CronJob;
const Axios = require('axios');
const Config = require('../config/env.config');

const GATSBY_BUILD_URL = Config.gatsbyEndpoint;

function updateGatsby() {
    console.log('Gatsby build request will be send');

    Axios.post(GATSBY_BUILD_URL).then( () => {
        console.log('Gatsby build request was successful');
    });
}

function updateDaily() {
    GitHubController.update().then(() => {
        updateGatsby();
    });
}

exports.startCronJobs = function () {
    new CronJob('* * * * *', function () {
        updateDaily();
    }, null, true, 'UTC');
};
