import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Node, NodeView, NodeViewProps, NodeViewRendererProps, Editor, NodeViewRendererOptions, getSchema, NodeViewRenderer } from "@tiptap/core"
import { Decoration, NodeView as ProseMirrorNodeView} from 'prosemirror-view'
import lowlight from "lowlight";
import mermaid from "mermaid";
class PureNodeView extends NodeView<any, Editor, NodeViewRendererOptions> {
}
export enum MODE {
  PREVIEW,
  EDIT
}
mermaid.initialize({
  startOnLoad:true,
  htmlLabels:true,
});
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
        
        if(node.attrs.language === "mermaid") {
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
          
          // console.log(node.attrs);
          if(node.attrs.source === "hidden") {
            pre.classList.add("hidden");
          }
          pre.setAttribute("language", "mermaid");
          code.dataset.nodeViewContent = "";
          pre.dataset.nodeViewWrapper = "";
          // code.classList.add('mermaid');
          pre.append(code)

          const content = document.createElement('code');
          content.setAttribute("language", "mermaid");
          content.classList.add('content');
          content.classList.add(`language-${node.attrs.language}`)
          // content.innerHTML = /\<\"((.|\n)*)\"\>/.exec(node.content.toString())[1].replace(/\\n/g, '\n')
          content.textContent = /\<\"((.|\n)*)\"\>/.exec(node.content.toString())[1].replace(/\\n/g, '\n')
          content.classList.add("mermaid");
         
          // (window as any).mermaid = mermaid;
          if(node.attrs.content === "hidden") {
            content.classList.add("hidden");
          } else {
            try {
              // console.log(node.textContent);
              // content.innerHTML = mermaid.render(`mermaid-${Date.now()}`, node.textContent, () => {}, content);
            } catch (e) {
              console.log(e);
            }
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
            // updateAttributes({content : ""})
            node.attrs.content = "";
            content.classList.remove('hidden');
          });
          const CustomNode = new NodeView(dom, props);

          return {
            dom : CustomNode.dom,
            contentDOM : CustomNode.contentDOM,
            update(node, decorations, innerDecorations) {
              // content.innerHTML = mermaid.render(`mermaid-${Date.now()}`, node.textContent, () => {}, content);
              // console.log('update' , node, decorations, innerDecorations)
            },
            destroy() {
              // console.log('destory');
              // content.innerHTML = mermaid.render(`mermaid-${Date.now()}`, node.textContent, () => {}, content);
            },
            stopEvent(e) {
              // console.log('stopEvent', e)
            },
            selectNode() {
              // console.log('selectNode')
            },
            deselectNode() {
              // console.log('deSelectNode')
            }
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