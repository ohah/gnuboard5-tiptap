import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Node, NodeView, NodeViewProps, NodeViewRendererProps, Editor, NodeViewRendererOptions, getSchema } from "@tiptap/core"
import { Decoration, NodeView as ProseMirrorNodeView} from 'prosemirror-view'
import lowlight from "lowlight";
import mermaid from "mermaid";
class PureNodeView extends NodeView<any, Editor, NodeViewRendererOptions> {
}
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
        // const CustomNode = new NodeView("<div>무야호</div>", props);
        if(node.attrs.language === "mermaid") {
          // const dom = document.createElement('div');
          // const wrapper = document.createElement('div');
          // console.log(extension);
          // // dom.contentEditable = "true";
          // dom.textContent = /\<\"((.|\n)*)\"\>/.exec(node.content.toString())[1].replace(/\\n/g, '\n')
          // dom.className = "mermaid";
          // mermaid.initialize({
          //   startOnLoad:true,
          //   htmlLabels:true,
          // });
          // // dom.dataset.dataNodeViewContent = "";
          // // wrapper.dataset.dataNodeViewWrapper = "";
          // // console.log('element', CustomNode.node);
          // // wrapper.append(CustomNode.dom);
          // wrapper.appendChild(dom);
          const dom = document.createElement('div');
          dom.classList.add('mermaid-editor-btn-group');

          const source = document.createElement('button');

          source.classList.add('source');
          source.innerHTML = `<i class="ri-code-s-slash-line"></i>`;
          source.contentEditable = "false";

          const preview = document.createElement('button');

          preview.classList.add('preview');
          preview.innerHTML = `<i class="ri-organization-chart"></i>`;
          preview.contentEditable = "false";

          const pre = document.createElement('pre');
          pre.style.marginTop = "0"
          const code = document.createElement('code');
          code.classList.add(`language-${node.attrs.language}`)
          
          console.log(node.attrs);
          if(node.attrs.source === "hidden") {
            pre.classList.add("hidden");
          }
          pre.setAttribute("language", "mermaid");
          code.classList.add('mermaid');
          pre.append(code)

          const content = document.createElement('code');
          content.setAttribute("language", "mermaid");
          content.classList.add('content');
          content.classList.add(`language-${node.attrs.language}`)
          // content.innerHTML = /\<\"((.|\n)*)\"\>/.exec(node.content.toString())[1].replace(/\\n/g, '\n')
          content.textContent = /\<\"((.|\n)*)\"\>/.exec(node.content.toString())[1].replace(/\\n/g, '\n')
          content.classList.add("mermaid");
          (window as any).mermaid = mermaid;
          if(node.attrs.content === "hidden") {
            content.classList.add("hidden");
          }else {
          }
          dom.append(source, preview, pre, content);
          source.addEventListener('click', (e)=>{
            if(node.attrs.source === "hidden") {
              node.attrs.source = "";
              pre.classList.remove('hidden');
            } else {
              node.attrs.source = "hidden";
              pre.classList.add('hidden');
            }
          });
          
          
          preview.addEventListener('click', (e)=>{
            node.attrs.content = "";
            content.classList.remove('hidden');
          })
          mermaid.initialize({
            startOnLoad:true,
            htmlLabels:true,
          });
          return {
            dom : dom,
            // contentDOM : code,
          }
        } else {
          // return {
          //   dom : CustomNode.mount(),
          //   contentDOM : CustomNode
          // }
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
        class : {
          default : "",
        },
        source : {
          default : ""
        },
        preview : {
          default : ""
        },
        content : {
          default : "",
        },
        id: {
          // default: 'content',
        }
      }
    },
  })
  .configure({ lowlight });