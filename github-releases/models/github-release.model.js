const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI ||'mongodb://localhost/release-tracker';

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
const Schema = mongoose.Schema;

const gitHubReleaseSchema = new Schema({
    owner: String,
    name: String,
    createdAt: String,
    resourcePath: String,
    tagName: String,
    homepageUrl: String,
    description: String
});

gitHubReleaseSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
gitHubReleaseSchema.set('toJSON', {
    virtuals: true
});

gitHubReleaseSchema.findById = function (cb) {
    return this.model('GitHubRelease').find({id: this.id}, cb);
};

const GitHubRelease = mongoose.model('github-release', gitHubReleaseSchema);


exports.findByOwnerAndName = (owner, name) => {
    return GitHubRelease.find({owner: owner, name: name});
};

exports.findById = (id) => {
    return GitHubRelease.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createGitHubRelease = (gitHubReleaseData) => {
    const gitHubRelease = new GitHubRelease(gitHubReleaseData);
    return gitHubRelease.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        GitHubRelease.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.count = function(cb) {
    return GitHubRelease.collection.countDocuments({}, cb);
};

exports.patchGitHubRelease = (id, gitHubReleaseData) => {
    return new Promise((resolve, reject) => {
        GitHubRelease.findById(id, function (err, gitHubRelease) {
            if (err) reject(err);
            for (let i in gitHubReleaseData) {
                gitHubRelease[i] = gitHubReleaseData[i];
            }
            gitHubRelease.save(function (err, updatedGitHubRelease) {
                if (err) return reject(err);
                resolve(updatedGitHubRelease);
            });
        });
    })

};

exports.removeById = (gitHubReleaseId) => {
    return new Promise((resolve, reject) => {
        GitHubRelease.remove({_id: gitHubReleaseId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

