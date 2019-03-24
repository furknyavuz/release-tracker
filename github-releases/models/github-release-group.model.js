const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI ||'mongodb://localhost/release-tracker';

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
const Schema = mongoose.Schema;

const gitHubReleaseGroupSchema = new Schema({
    name: String,
    description: String
});

gitHubReleaseGroupSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
gitHubReleaseGroupSchema.set('toJSON', {
    virtuals: true
});

gitHubReleaseGroupSchema.findById = function (cb) {
    return this.model('GitHubReleaseGroup').find({id: this.id}, cb);
};

const GitHubReleaseGroup = mongoose.model('github-releases-group', gitHubReleaseGroupSchema);

exports.findByName = (name) => {
    return GitHubReleaseGroup.find({name: name});
};

exports.findById = (id) => {
    return GitHubReleaseGroup.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createGitHubReleaseGroup = (gitHubReleaseGroupData) => {
    const gitHubReleaseGroup = new GitHubReleaseGroup(gitHubReleaseGroupData);
    return gitHubReleaseGroup.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        GitHubReleaseGroup.find()
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
    return GitHubReleaseGroup.collection.countDocuments({}, cb);
};

exports.patchGitHubReleaseGroup = (id, gitHubReleaseGroupData) => {
    return new Promise((resolve, reject) => {
        GitHubReleaseGroup.findById(id, function (err, gitHubReleaseGroup) {
            if (err) reject(err);
            for (let i in gitHubReleaseGroupData) {
                gitHubReleaseGroup[i] = gitHubReleaseGroupData[i];
            }
            gitHubReleaseGroup.save(function (err, updatedGitHubReleaseGroup) {
                if (err) return reject(err);
                resolve(updatedGitHubReleaseGroup);
            });
        });
    })

};

exports.removeById = (gitHubReleaseGroupId) => {
    return new Promise((resolve, reject) => {
        GitHubReleaseGroup.remove({_id: gitHubReleaseGroupId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

