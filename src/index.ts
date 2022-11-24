import { commands, ExtensionContext, OutputChannel, window, workspace } from 'coc.nvim'
import {
  IMainMethod,
  getAllJavaProjects,
  resolveClasspath,
  resolveJavaExecutable,
  resolveMainMethod,
} from './languageServerPlugin'

import { spawn } from 'child_process'

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('java-ext')
  const output = window.createOutputChannel('java-ext')

  output.appendLine('coc-java-ext activated')
  const debugEnabled = config.get<boolean>('debug')
  if (debugEnabled) {
    output.appendLine('Debug enabled')
  }

  const outputs = new Map<string, OutputChannel>()

  context.subscriptions.push(
    commands.registerCommand('java.ext.launchMain', async () => {
      const doc = await workspace.document
      const methods = await resolveMainMethod(doc.uri)

      if (methods.length === 0) {
        window.showMessage('No main method found', 'warning')
        return
      }

      // const method: IMainMethod = methods[await window.showQuickpick(methods.map((m) => m.mainClass))]
      const method: IMainMethod = methods[0]
      const cp = await resolveClasspath(method.mainClass, method.projectName ?? '')
      const java = await resolveJavaExecutable(method.mainClass, method.projectName ?? '')

      const cmd = `${shellEscape(java)} -cp ${shellEscape(cp.flat().join(':'))} ${method.mainClass}`
      // const projects = await getAllJavaProjects()
      // output.appendLine(projects.toString())

      const outputId = `Launch output ${method.projectName} ${method.mainClass}`
      let lo = outputs.get(outputId)
      if (!lo) {
        lo = window.createOutputChannel(outputId)
        outputs.set(outputId, lo)
        lo.show()
      } else {
        lo.clear()
      }
      lo.appendLine(`launchMain:\n${cmd}\n`)
      const p = spawn(java, ['-cp', cp.flat().join(':'), method.mainClass], {
        stdio: 'pipe',
        cwd: workspace.cwd,
      })
      p.stdout.on('data', (data) => {
        lo?.append(data.toString())
      })
      p.stderr.on('data', (data) => {
        lo?.append(data.toString())
      })

      // const cmdLaucnch = 'split term://'
      // workspace.nvim.command(cmdLaucnch + cmd)
    }),

    commands.registerCommand('java.ext.launchProjectMain', async () => {
      const doc = await workspace.document
      window.showMessage('not implemented yet', 'warning')
      // idea:
      // save project listing in a list
      // check doc.uri starts with project uri
      // project listing is cached
      // check /Users/jackieli/personal/vscode-java/src/runtimeStatusBarProvider.ts:124
    })

    // listManager.registerList(new DemoList(workspace.nvim)),

    // sources.createSource({
    //   name: 'coc-java-ext completion source', // unique id
    //   doComplete: async () => {
    //     const items = await getCompletionItems()
    //     return items
    //   },
    // }),

    // workspace.registerKeymap(
    //   ['n'],
    //   'java-ext-keymap',
    //   async () => {
    //     window.showMessage(`registerKeymap`)
    //   },
    //   { sync: false }
    // ),
    //
    // workspace.registerAutocmd({
    //   event: 'InsertLeave',
    //   request: true,
    //   callback: () => {
    //     window.showMessage(`registerAutocmd on InsertLeave`)
    //   },
    // })
  )
}

// async function getCompletionItems(): Promise<CompleteResult> {
//   return {
//     items: [
//       {
//         word: 'TestCompletionItem 1',
//         menu: '[coc-java-ext]',
//       },
//       {
//         word: 'TestCompletionItem 2',
//         menu: '[coc-java-ext]',
//       },
//     ],
//   }
// }
//
function shellEscape(...args: string[]): string {
  const ret: string[] = []
  args.forEach(function (s) {
    if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
      s = "'" + s.replace(/'/g, "'\\''") + "'"
      s = s
        .replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'") // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s)
  })

  return ret.join(' ')
}
