import { commands, ExtensionContext, window, workspace } from 'coc.nvim'
import { IMainMethod, resolveClasspath, resolveJavaExecutable, resolveMainMethod } from './languageServerPlugin'

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand('java.debug.launchMain', async () => {
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

      const cmd = `split term://${shellEscape(java)} -cp ${shellEscape(cp.flat().join(':'))} ${method.mainClass}`
      if (workspace.getConfiguration('java-debug').get<boolean>('debug')) {
        console.log(cmd)
      }
      workspace.nvim.command(cmd)
    }),

    commands.registerCommand('java.debug.launchProjectMain', async () => {
      const doc = await workspace.document
      // idea:
      // save project listing in a list
      // check doc.uri starts with project uri
      // project listing is cached
      // check /Users/jackieli/personal/vscode-java/src/runtimeStatusBarProvider.ts:124
    })

    // listManager.registerList(new DemoList(workspace.nvim)),

    // sources.createSource({
    //   name: 'coc-java-debug completion source', // unique id
    //   doComplete: async () => {
    //     const items = await getCompletionItems()
    //     return items
    //   },
    // }),

    // workspace.registerKeymap(
    //   ['n'],
    //   'java-debug-keymap',
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
//         menu: '[coc-java-debug]',
//       },
//       {
//         word: 'TestCompletionItem 2',
//         menu: '[coc-java-debug]',
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
