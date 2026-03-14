import { Extension } from '@tiptap/core'

export interface AriScoreStorage {
  score: number;
}

export const AriScoreExtension = Extension.create<any, AriScoreStorage>({
  name: 'ariScore',

  addStorage() {
    return {
      score: 0,
    }
  },

  onUpdate() {
    const text = this.editor.getText()
    this.storage.score = this.options.calculate(text)
  },

  addOptions() {
    return {
      calculate: (text: string) => {
        // Count letters only (A-Z, no numbers)
        const letters = (text.match(/[A-Za-z]/g) || []).length

        // Count words
        const words = (text.match(/\w+/g) || []).length

        // Count sentences (. ! ?)
        let sentences = (text.match(/[.!?]/g) || []).length

        // If no sentences but has words, treat as 1 sentence
        if (sentences === 0 && words > 0) {
          sentences = 1
        }

        // Return 0 if no words or sentences
        if (words === 0 || sentences === 0) return 0

        // ARI Formula: 4.71 * (letters / words) + 0.5 * (words / sentences) - 21.43
        const score = Math.round(4.71 * (letters / words) + 0.5 * (words / sentences) - 21.43)

        // Return 0 if negative, else return score
        return score <= 0 ? 0 : score
      },
    }
  },
})