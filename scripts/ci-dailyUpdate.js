const onCircle = require('on-circle');
const dayjs = require('golgoth/dayjs');
const run = require('firost/run');
const consoleInfo = require('firost/consoleInfo');
const _ = require('golgoth/lodash');

(async () => {
  await onCircle.run(
    async ({ success, gitChangedFiles, gitCommitAll, gitPush }) => {
      consoleInfo('Running incremental update');
      await run('yarn run data:incremental');

      const changedFiles = await gitChangedFiles();
      if (_.isEmpty(changedFiles)) {
        success('No files changed, we stop early');
      }

      // Commit changes
      const currentDate = dayjs.utc().format('YYYY-MM-DD');
      const commitMessage = `chore(ci): Daily update (${currentDate})`;
      consoleInfo(`${changedFiles.length} files changed, commiting`);
      await gitCommitAll(commitMessage);

      // And push
      consoleInfo('Pushing changes to the repo');
      await gitPush();

      // Re-index into Algolia
      consoleInfo('Updating Algolia index');
      await run('yarn run data:indexing');

      success('Daily data updated');
    }
  );
})();
