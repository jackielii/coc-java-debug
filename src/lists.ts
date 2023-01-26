import { BasicList, ListContext, ListItem, Neovim, window, workspace } from 'coc.nvim'
import { URI } from 'vscode-uri'
import { getProjects, INodeData } from './languageServerPlugin'

export default class ProjectList extends BasicList {
  public readonly name = 'java_project_list'
  public readonly description = 'Java Projects'

  public projects: INodeData[] = []

  constructor(nvim: Neovim) {
    super(nvim)
    this.defaultAction = 'info'
    this.addAction('info', async (item: ListItem) => {
      window.showInformationMessage(JSON.stringify(item.data, null, 2))
    })
  }

  // TODO: hook up to workspace config change to refresh items
  public async loadItems(_context: ListContext): Promise<ListItem[]> {
    if (this.projects.length === 0) {
      this.projects = await getProjects(URI.file(workspace.root).toString())
    }

    return this.projects.map((project) => {
      return {
        label: project.displayName ?? project.name,
        data: project,
      }
    })
  }
}
