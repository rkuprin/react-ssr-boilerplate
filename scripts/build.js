process.env.NODE_ENV = 'production'
process.env.PUBLIC_URL = process.env.PUBLIC_URL || ''

const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild
} = require('react-dev-utils/FileSizeReporter')

const clientConfig = require('../config/webpack.config.client.prod')
const serverConfig = require('../config/webpack.config.server.prod')

process.on('unhandledRejection', err => {
  throw err
})

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

const resolvePath = relativePath => path.resolve(__dirname, relativePath)

measureFileSizesBeforeBuild(resolvePath('../build'))
  .then(previousFileSizes => {
    fs.emptyDirSync(resolvePath('../build'))
    return build(previousFileSizes)
  })
  .then(
    result => printResult(result),
    err => {
      console.log('Failed to compile.\n')
      console.log((err.message || err) + '\n')
      process.exit(1)
    }
  );

function build(previousFileSizes) {
  console.log('\n\tCreating an optimized production build...\n')

  const clientCompiler = webpack(clientConfig)
  const serverCompiler = webpack(serverConfig)

  return new Promise((resolve, reject) => {
    clientCompiler.run((err, stats) => {
      if (err) {
        return reject(err)
      } else {
        console.log('Client webpack build complete')
      }

      serverCompiler.run(err => {
        if (err) {
          return reject(err)
        } else {
          console.log('Server webpack build complete')
        }

        const messages = formatWebpackMessages(stats.toJson({}, true))

        if (messages.errors.length) {
          return reject(new Error(messages.errors.join('\n\n')))
        }

        resolve({
          stats,
          previousFileSizes,
          warnings: messages.warnings
        })
      })
    })
  })
}

function printResult({ stats, previousFileSizes, warnings }) {
  if (warnings.length) {
    console.log('Compiled with warnings.\n')
    console.log(warnings.join('\n\n'))
  } else {
    console.log('Compiled successfully.\n')
  }

  console.log('File sizes after gzip:\n')
  printFileSizesAfterBuild(
    stats,
    previousFileSizes,
    resolvePath('../build'),
    WARN_AFTER_BUNDLE_GZIP_SIZE,
    WARN_AFTER_CHUNK_GZIP_SIZE
  )
}