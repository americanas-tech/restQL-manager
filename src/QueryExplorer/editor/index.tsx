import CodeMirror from 'codemirror';
import CodeMirrorEditor from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/eclipse.css';
import './restql.js';

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
        value={content || ""}
        options={{
          theme: 'eclipse',
          keyMap: 'sublime',
          mode: 'restql',
          lineWrapping: true,
        }}
        height={height}
        width={width}
        onChange={(instance: CodeMirror.Editor, changes: CodeMirror.EditorChangeLinkedList[]) => {
          const linkedChanges = changes as unknown as CodeMirror.EditorChangeLinkedList;

          if (allChangesAreFromInput(linkedChanges)) {
            onChange(instance.getValue());
          }
        }}
      />
    </div>
  )
}

function allChangesAreFromInput(changes: CodeMirror.EditorChangeLinkedList): boolean {
  let change: CodeMirror.EditorChangeLinkedList | null = changes;
  do {
    if (change.origin !== "+input" && change.origin !== "+delete") {
      return false
    }

    change = changes.next || null;
  } while (change);

  return true
}

export default Editor
