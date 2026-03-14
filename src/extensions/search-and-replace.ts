import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SearchAndReplaceOptions {
  searchTerm: string
  replaceTerm: string
  results: Array<{ from: number; to: number }>
  searchResultClass: string
  searchResultCurrentClass: string
  caseSensitive: boolean
  disableRegex: boolean
}

export interface SearchAndReplaceStorage {
  searchTerm: string
  replaceTerm: string
  results: Array<{ from: number; to: number }>
  lastSearchTerm: string
  caseSensitive: boolean
  lastCaseSensitive: boolean
  resultIndex: number
  lastResultIndex: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (searchTerm: string) => ReturnType
      setReplaceTerm: (replaceTerm: string) => ReturnType
      setCaseSensitive: (caseSensitive: boolean) => ReturnType
      resetIndex: () => ReturnType
      nextSearchResult: () => ReturnType
      previousSearchResult: () => ReturnType
      replace: () => ReturnType
      replaceAll: () => ReturnType
    }
  }
}

// Helper to update transaction
const updateTransaction = (state: any, dispatch: any) => dispatch(state.tr)

// Create regex from search term
function createRegex(searchTerm: string, disableRegex: boolean, caseSensitive: boolean): RegExp {
  return RegExp(
    disableRegex ? searchTerm.replace(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`) : searchTerm,
    caseSensitive ? 'gu' : 'gui'
  )
}

// Find all matches and create decorations
function processSearchMatches(
  doc: any,
  regex: RegExp | null,
  searchResultClass: string,
  currentIndex: number
) {
  const decorations: any[] = []
  const results: Array<{ from: number; to: number }> = []
  let textNodesWithPosition: Array<{ text: string; pos: number }> = []
  let index = 0

  if (!regex) {
    return {
      decorationsToReturn: DecorationSet.empty,
      results: [],
    }
  }

  // Collect all text nodes
  doc?.descendants((node: any, pos: number) => {
    if (node.isText) {
      if (textNodesWithPosition[index]) {
        textNodesWithPosition[index] = {
          text: textNodesWithPosition[index].text + node.text,
          pos: textNodesWithPosition[index].pos,
        }
      } else {
        textNodesWithPosition[index] = {
          text: `${node.text}`,
          pos,
        }
      }
    } else {
      index += 1
    }
  })

  textNodesWithPosition = textNodesWithPosition.filter(Boolean)

  // Find matches in text nodes
  for (const { text, pos } of textNodesWithPosition) {
    const matches = Array.from(text.matchAll(regex)).filter(
      ([match]) => match.trim()
    )

    for (const match of matches) {
      if (match[0] === '') break
      if (match.index !== undefined) {
        results.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        })
      }
    }
  }

  // Create decorations
  for (const [index, result] of results.entries()) {
    const className =
      index === currentIndex
        ? `${searchResultClass} ${searchResultClass}-current`
        : searchResultClass

    const decoration = Decoration.inline(result.from, result.to, {
      class: className,
    })
    decorations.push(decoration)
  }

  return {
    decorationsToReturn: DecorationSet.create(doc, decorations),
    results,
  }
}

// Replace single occurrence
function replaceMatch(
  replaceTerm: string,
  results: Array<{ from: number; to: number }>,
  { state, dispatch }: any
) {
  if (!results[0]) return

  const { from, to } = results[0]
  if (dispatch) {
    dispatch(state.tr.insertText(replaceTerm, from, to))
  }
}

// Update positions after replacement
function updatePositions(
  replaceTerm: string,
  currentIndex: number,
  offset: number,
  results: Array<{ from: number; to: number }>
) {
  const nextIndex = currentIndex + 1
  if (!results[nextIndex]) return null

  const { from: currentFrom, to: currentTo } = results[currentIndex]
  const positionDifference = currentTo - currentFrom - replaceTerm.length + offset

  const { from: nextFrom, to: nextTo } = results[nextIndex]
  results[nextIndex] = {
    to: nextTo - positionDifference,
    from: nextFrom - positionDifference,
  }

  return [positionDifference, results]
}

// Replace all occurrences
function replaceAll(
  replaceTerm: string,
  results: Array<{ from: number; to: number }>,
  { tr, dispatch }: any
) {
  let offset = 0
  let updatedResults = results.slice()

  if (updatedResults.length === 0) return

  for (let i = 0; i < updatedResults.length; i += 1) {
    const { from, to } = updatedResults[i]
    tr.insertText(replaceTerm, from, to)

    const update = updatePositions(replaceTerm, i, offset, updatedResults)
    if (update) {
      offset = update[0]
      updatedResults = update[1]
    }
  }

  dispatch(tr)
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addOptions() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      searchResultClass: 'search-result',
      searchResultCurrentClass: 'search-result-current',
      caseSensitive: false,
      disableRegex: true,
    }
  },

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      lastSearchTerm: '',
      caseSensitive: false,
      lastCaseSensitive: false,
      resultIndex: 0,
      lastResultIndex: 0,
    }
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor, state, dispatch }) => {
          editor.storage.searchAndReplace.searchTerm = searchTerm
          updateTransaction(state, dispatch)
          return false
        },

      setReplaceTerm:
        (replaceTerm: string) =>
        ({ editor, state, dispatch }) => {
          editor.storage.searchAndReplace.replaceTerm = replaceTerm
          updateTransaction(state, dispatch)
          return false
        },

      setCaseSensitive:
        (caseSensitive: boolean) =>
        ({ editor, state, dispatch }) => {
          editor.storage.searchAndReplace.caseSensitive = caseSensitive
          updateTransaction(state, dispatch)
          return false
        },

      resetIndex:
        () =>
        ({ editor, state, dispatch }) => {
          editor.storage.searchAndReplace.resultIndex = 0
          updateTransaction(state, dispatch)
          return false
        },

      nextSearchResult:
        () =>
        ({ editor }) => {
          const { results, resultIndex } = editor.storage.searchAndReplace
          const nextIndex = resultIndex + 1

          if (results[nextIndex]) {
            editor.storage.searchAndReplace.resultIndex = nextIndex
          } else {
            editor.storage.searchAndReplace.resultIndex = 0
          }

          return false
        },

      previousSearchResult:
        () =>
        ({ editor }) => {
          const { results, resultIndex } = editor.storage.searchAndReplace
          const prevIndex = resultIndex - 1

          if (results[prevIndex]) {
            editor.storage.searchAndReplace.resultIndex = prevIndex
          } else {
            editor.storage.searchAndReplace.resultIndex = results.length - 1
          }

          return false
        },

      replace:
        () =>
        ({ editor, state, dispatch }) => {
          const { replaceTerm, results, resultIndex } = editor.storage.searchAndReplace
          const currentResult = results[resultIndex]

          if (currentResult) {
            replaceMatch(replaceTerm, [currentResult], { state, dispatch })
            editor.storage.searchAndReplace.results.splice(resultIndex, 1)
          } else {
            replaceMatch(replaceTerm, results, { state, dispatch })
            editor.storage.searchAndReplace.results.shift()
          }

          updateTransaction(state, dispatch)
          return false
        },

      replaceAll:
        () =>
        ({ editor, tr, state, dispatch }) => {
          const { replaceTerm, results } = editor.storage.searchAndReplace

          replaceAll(replaceTerm, results, { tr, dispatch })
          editor.storage.searchAndReplace.resultIndex = 0
          editor.storage.searchAndReplace.results = []
          updateTransaction(state, dispatch)
          return false
        },
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor
    const { searchResultClass, disableRegex } = this.options

    const setLastSearchTerm = (term: string) =>
      (editor.storage.searchAndReplace.lastSearchTerm = term)
    const setLastCaseSensitive = (caseSensitive: boolean) =>
      (editor.storage.searchAndReplace.lastCaseSensitive = caseSensitive)
    const setLastResultIndex = (index: number) =>
      (editor.storage.searchAndReplace.lastResultIndex = index)

    return [
      new Plugin({
        key: new PluginKey(`richtextCustomPlugin${this.name}`),
        state: {
          init: () => DecorationSet.empty,
          apply({ doc, docChanged }, oldState) {
            const {
              searchTerm,
              lastSearchTerm,
              caseSensitive,
              lastCaseSensitive,
              resultIndex,
              lastResultIndex,
            } = editor.storage.searchAndReplace

            // No changes, return old state
            if (
              !docChanged &&
              lastSearchTerm === searchTerm &&
              lastCaseSensitive === caseSensitive &&
              lastResultIndex === resultIndex
            ) {
              return oldState
            }

            // Update last values
            setLastSearchTerm(searchTerm)
            setLastCaseSensitive(caseSensitive)
            setLastResultIndex(resultIndex)

            // Clear if no search term
            if (!searchTerm) {
              editor.storage.searchAndReplace.results = []
              return DecorationSet.empty
            }

            // Process search
            const { decorationsToReturn, results } = processSearchMatches(
              doc,
              createRegex(searchTerm, disableRegex, caseSensitive),
              searchResultClass,
              resultIndex
            )

            editor.storage.searchAndReplace.results = results
            return decorationsToReturn
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
