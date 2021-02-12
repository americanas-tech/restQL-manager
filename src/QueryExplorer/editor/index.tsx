import CodeMirror from 'codemirror';
import CodeMirrorEditor from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/eclipse.css';
import './restql.js';

type EditorProps = {
  className: string,
  code: string,
  height: number,
  width: number,
  onChange: (content: string) => void
}


function Editor(props: EditorProps) {
  const { code, onChange, height, width, className } = props

  return (
    <div className={className}>
      <CodeMirrorEditor
        value={code}
        options={{
          theme: 'eclipse',
          keyMap: 'sublime',
          mode: 'restql',
          lineWrapping: true,
        }}
        height={height}
        width={width}
        onChange={(instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList[]) => {
          onChange(instance.getDoc().getValue())
        }}
      />
    </div>
  )
}

export default Editor
