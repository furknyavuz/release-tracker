const CronJob = require('cron').CronJob;
const request = require('request');

const GATSBY_BUILD_URL = 'https://api.netlify.com/build_hooks/5c956202a33991f9a62144ea';

function gatsbyBuild() {

    console.log('Gatsby Build Started');

    request.post({
        url: GATSBY_BUILD_URL
    }, function (error, response, body) {
    });
}

exports.startCronJobs = function () {
    new CronJob('0 2 * * *', function () {
        gatsbyBuild();
    }, null, true, 'UTC');
};
