'use strict';

const errorTypes = require('../constants/error-types');
const github = require('../services/github');

module.exports = emitter => (repository, callback) => {
  if (!repository.prInfo.found || !repository.prInfo.outdated) {
    return callback(null, repository);
  }

  emitter.emit('action', { message: `Closing outdated pull request for ${repository.owner}/${repository.repo}` });

  const prOptions = {
    number: repository.prInfo.number,
    owner: repository.owner,
    repo: repository.repo
  };

  github.closePullRequest(prOptions, err => {
    if (err) {
      err = new Error('Failed while closing pull request');
      emitter.emit('error', { error: err, errorType: errorTypes.failedToClosePullRequest, details: repository });
      repository.skip = true;
    }

    repository.prInfo.closed = true;

    callback(err, repository);
  });
};
