
import { NodeView, NodeViewRendererOptions, NodeViewRendererProps, NodeViewRenderer } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import lowlight from "lowlight";
import mermaid from "mermaid";
import { CodeBlockOptionsView } from "./CodeBlockOptionsView";
import { KatexNodeView } from "./KatexCodeBlock";
import { MermaidNodeView } from "./MermaidNodeView";

/**
 * 미리보기만 보일 때 커서나 포커스가 이동하면, MULTIVIEW로 자동 변경 기능을 나중에 추가할것
 */
export enum EDITABLE {
  /** 코드만 */
  CODE = "CODE",
  /** 미리보기 */
  PREVIEW =  "PREVIEW",
  /** 동시에 */
  MULTIVIEW = "MULTIEVIEW",
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
          extension : extension,
        }
        if(node.attrs.language === "katex") {
          const NodeView = new KatexNodeView("", props);
          return {
            dom : NodeView.dom,
            contentDOM : NodeView.contentDOM,
          }          
        } else if(node.attrs.language === "mermaid") {    
          const NodeView = new MermaidNodeView("", props);
          return {
            dom : NodeView.dom,
            contentDOM : NodeView.contentDOM,
          }          
        } else {
          const NodeView = new CodeBlockOptionsView("", props);
          return {
            dom : NodeView.dom,
            contentDOM : NodeView.contentDOM,
          }
        }
      }
    },
    addAttributes() {
      return {
        language: {
          default: null
        },
        editable : {
          default : EDITABLE.MULTIVIEW
        },
      }
    },
  })
  .configure({ lowlight });