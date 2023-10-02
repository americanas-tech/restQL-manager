import CodeMirrorEditor, { keymap, ViewUpdate } from '@uiw/react-codemirror'
import { restQL } from './restql'
import { theme } from './style'
import { basicSetup } from 'codemirror'
import { defaultKeymap } from '@codemirror/commands'

type EditorProps = {
  className: string,
  content: string | null,
  height: number,
  width: number,
  onChange: (content: string) => void
}

function Editor(props: EditorProps) {
  const { content, onChange, height, width, className } = props

  return (
    <div className={className}>
      <CodeMirrorEditor
        value={content || ''}
        height={height.toString() + 'px'}
        width={width.toString() + 'px'}
        theme={theme}
        extensions={[basicSetup, restQL(), keymap.of(defaultKeymap)]}
        onChange={validateChange}
      />
    </div>
  )

  function validateChange(value: string, viewUpdate: ViewUpdate) {
    if (viewUpdate.docChanged) {
      onChange(value)
    }
  }
}

export default Editor
