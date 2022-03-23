import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Node, NodeView, NodeViewProps, NodeViewRendererProps } from "@tiptap/core"
import lowlight from "lowlight";
import mermaid from "mermaid";
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
        const CustomNode = new NodeView("<div> asdf </div>", props);
        CustomNode.mount();
        if(node.attrs.language === "mermaid") {
          const dom = document.createElement('div');
          const wrapper = document.createElement('div');
          console.log(editor, node, extension, CustomNode);
          // dom.contentEditable = "true";
          console.log(node.content.toString().replace(/\\t/g, ''))
          dom.textContent = /\<\"((.|\n)*)\"\>/.exec(node.content.toString())[1].replace(/\\n/g, '\n')
          dom.className = "mermaid";
          mermaid.initialize({startOnLoad:true});
          dom.dataset.dataNodeViewContent = "";
          wrapper.dataset.dataNodeViewWrapper="";
          console.log('element', CustomNode.node);
          wrapper.append(CustomNode.dom);
          return {
            dom : wrapper,
            contentDOM : dom,
          }
        } else {
          return {
            dom : CustomNode.mount(),
            contentDOM : CustomNode
          }
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
          // default: 'content',
        }
      }
    },
  })
  .configure({ lowlight });