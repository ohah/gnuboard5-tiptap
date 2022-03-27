export default "./iframe"
import { NodeView, NodeViewRendererOptions,NodeViewRenderer,  NodeViewRendererProps, Editor, EditorOptions } from "@tiptap/core";
import { Decoration, NodeView as ProseMirrorNodeView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import lowlight from "lowlight";
import mermaid from "mermaid";
mermaid.initialize({
  startOnLoad:false,
});
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

export class MermaidNodeView extends NodeView<any, Editor, NodeViewRendererOptions> {
  
  contentDOMElement! : HTMLElement | null

  content!: HTMLElement
  
  mount() {
    const { editor, node, getPos, decorations, updateAttributes, extension } = this;
    const languages = extension.options.lowlight.listLanguages();    
    languages.push("mermaid");
    const select = document.createElement("select");
    select.classList.add("lang-select");
    select.contentEditable = "false";
    languages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang;
      if (lang === node.attrs.language) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    select.addEventListener( "change", (e) => {
      this.updateAttributes({ language: (e.target as HTMLSelectElement).value });
    },false);
    
    const wrapper = document.createElement("div");
    wrapper.classList.add("mermaid-editor-wrapper");

    const dom = document.createElement("div");
    dom.classList.add("code-block-wrapper");

    const source = document.createElement("button");

    source.classList.add("source");
    source.innerHTML = `<i class="ri-code-s-slash-line"></i>`;
    source.contentEditable = "false";

    const preview = document.createElement("button");

    preview.classList.add("preview");
    preview.innerHTML = `<i class="ri-organization-chart"></i>`;
    preview.contentEditable = "false";

    const multi = document.createElement("button");

    multi.classList.add("mulit");
    multi.innerHTML = `<i class="ri-book-read-line"></i>`;
    multi.contentEditable = "false";

    const pre = document.createElement("pre");
    pre.style.marginTop = "0";
    const code = document.createElement("div");
    code.classList.add(`language-${node.attrs.language}`);

    pre.setAttribute("language", "mermaid");
    pre.classList.add("code-block");
    pre.append(code);

    const content = document.createElement("code");
    content.classList.add("content");
    content.setAttribute("language", "mermaid");
    content.id = `mermaid-${Math.round(Math.random() * 10000)}`;
    content.classList.add(`language-${node.attrs.language}`);

    wrapper.append(pre, content);
    dom.append(source, preview, multi, select, wrapper);

    content.classList.add("mermaid");
    try {
      mermaid.parse(node.textContent);
      content.innerHTML = mermaid.render(content.id, node.textContent, undefined);
    } catch(e) {

    }

    if (node.attrs.editable === EDITABLE.MULTIVIEW) {
      pre.classList.remove("hidden");
      content.classList.remove("hidden");
    }

    if (node.attrs.editable === EDITABLE.CODE) {
      pre.classList.remove("hidden");
      content.classList.add("hidden");
    }

    if (node.attrs.editable === EDITABLE.PREVIEW) {
      content.classList.remove("hidden");
      pre.classList.add("hidden");
    }

    source.addEventListener("click",(e) => {
      node.attrs.editable = EDITABLE.CODE;
      dom.dataset.editable = EDITABLE.CODE;
    }, false);

    preview.addEventListener( "click", (e) => {
      node.attrs.editable = EDITABLE.PREVIEW;
      dom.dataset.editable = EDITABLE.PREVIEW;
    }, false);

    multi.addEventListener( "click", (e) => {
      node.attrs.editable = EDITABLE.MULTIVIEW;
      dom.dataset.editable = EDITABLE.MULTIVIEW; 
    }, false);

    this.component = dom;
    this.contentDOMElement = pre;
    this.content = content;
    
    const observer = new MutationObserver((mutations)=> {
      this.render();
    })
    observer.observe(pre, {
      characterDataOldValue : true,
      // childList : true,
      subtree : true,
    });
  }
  get dom(): Element {
    return this.component;
  }
  get contentDOM(): Element {
    return this.contentDOMElement
  }
 
  render() {
    try { 
      mermaid.parse(this.contentDOMElement.textContent);
      this.content.innerHTML = mermaid.render(this.content.id, this.contentDOMElement.textContent, undefined);
    } catch(e) {
    }
  }
  destroy() {
    this.component.dom.remove();
    this.component.contentDOM.remove();
  }
}