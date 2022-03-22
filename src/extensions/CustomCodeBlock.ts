import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Node, NodeView, NodeViewProps, NodeViewRendererProps } from "@tiptap/core"
import lowlight from "lowlight";

export enum MODE {
  PREVIEW,
  EDIT
}
export const CustomBlockExtension = CodeBlockLowlight
  .extend({
    addNodeView() {
      return ({ editor, node, getPos, HTMLAttributes, decorations, extension }) => {
        const props:NodeViewRendererProps = {
          editor : editor,
          node : node,
          getPos : getPos,
          HTMLAttributes : HTMLAttributes,
          decorations : decorations,
          extension : extension
        }
        const CustomNode = new NodeView(editor, props);
        console.log(CustomNode);
        const dom = document.createElement('div')
        console.log(editor, node, extension);
        dom.innerHTML = 'Hello, I’m a node view!'
        return {
          dom,
        }
      }
    },
    addAttributes() {
      return {
        mode: {
          default: MODE.EDIT,
        },
        language: {
          default: null
        },
        id: {
          default: 'content',
        }
      }
    },
  })
  .configure({ lowlight });