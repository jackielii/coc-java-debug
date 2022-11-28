# coc-java-ext

forked from vscode-java extensions, only a subset of functionality implemented:

**Commands**:

- [x] Launch main in current file (using built in terminal)
- [ ] Launch package
- [ ] Launch tests

**Lists**:

- [ ] Projects

**Debug**:

TODO

## Install

`:CocInstall coc-java-ext`

or install from source using `Plug`:

```vim
Plug 'jackielii/coc-java-ext', {'do': 'yarn'}
```

Using Plug you can modify the source code, making debugging easier. Note you
also need to build the extension jars. See `./scripts/build` for details. You
need to clone vscode-java-debug & vscode-java-dependency projects.

## License

EPL 1.0

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
