import CodeMirror from 'codemirror';
import CodeMirrorEditor from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import './restql.js';

type EditorProps = {
  className: string,
  code: string,
  onChange: (content: string) => void
}


function Editor(props: EditorProps) {
  const { code, onChange, className } = props

  return (
    <div className={className}>
      <CodeMirrorEditor
        value={code}
        options={{
          theme: 'monokai',
          keyMap: 'sublime',
          mode: 'restql',
          lineWrapping: true,
        }}
        onChange={(instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList[]) => {
          onChange(instance.getDoc().getValue())
        }}
      />
    </div>
  )
}

export default Editor
