/* eslint-disable @typescript-eslint/no-var-requires */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const debugServerDir = path.resolve('../java-debug')
const depServerDir = path.resolve('../vscode-java-dependency/jdtls.ext')

console.log('building java.debug...')
cp.execSync(mvnw() + ' clean package', { cwd: debugServerDir, stdio: [0, 1, 2] })
copy(path.join(debugServerDir, 'com.microsoft.java.debug.plugin/target'), path.resolve('server'), (file) => {
  return /^com.microsoft.java.debug.*.jar$/.test(file)
})

console.log('building jdtls.ext...')
cp.execSync(mvnw() + ' clean package', { cwd: depServerDir, stdio: [0, 1, 2] })
copy(path.join(depServerDir, 'com.microsoft.jdtls.ext.core/target'), path.resolve('server'), (file) => {
  return /^com.microsoft.jdtls.ext.core.*.jar$/.test(file)
})

function copy(sourceFolder, targetFolder, fileFilter) {
  const jars = fs.readdirSync(sourceFolder).filter((file) => fileFilter(file))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
  }
  for (const jar of jars) {
    fs.copyFileSync(path.join(sourceFolder, jar), path.join(targetFolder, path.basename(jar)))
  }
}

function isWin() {
  return /^win/.test(process.platform)
}

function isMac() {
  return /^darwin/.test(process.platform)
}

function isLinux() {
  return /^linux/.test(process.platform)
}

function mvnw() {
  return isWin() ? 'mvnw.cmd' : './mvnw'
}
