import katex from "katex"
import { NodeView, NodeViewRendererOptions,NodeViewRenderer,  NodeViewRendererProps, Editor, EditorOptions } from "@tiptap/core";
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

export class KatexNodeView extends NodeView<any, Editor, NodeViewRendererOptions> {
  
  contentDOMElement! : HTMLElement | null

  mount() {
    const { editor, node, getPos, decorations, updateAttributes, extension } = this;
    const languages = extension.options.lowlight.listLanguages();    
    languages.push("mermaid");
    languages.push("katex");
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
    wrapper.classList.add("katex-editor-wrapper");

    const dom = document.createElement("div");
    dom.classList.add("code-block-wrapper");

    const source = document.createElement("button");
    source.dataset.tooltip = "코드보기";
    source.classList.add("source");
    source.innerHTML = `<i class="ri-code-s-slash-line"></i>`;
    source.contentEditable = "false";

    const preview = document.createElement("button");

    preview.classList.add("preview");
    preview.dataset.tooltip = "미리보기";
    preview.innerHTML = `<i class="ri-organization-chart"></i>`;
    preview.contentEditable = "false";

    const multi = document.createElement("button");
    multi.dataset.tooltip = "같이보기";
    multi.classList.add("mulit");
    multi.innerHTML = `<i class="ri-book-read-line"></i>`;
    multi.contentEditable = "false";

    const pre = document.createElement("pre");
    pre.style.marginTop = "0";
    const code = document.createElement("div");
    code.classList.add(`language-${node.attrs.language}`);

    pre.setAttribute("language", "katex");
    pre.classList.add("code-block");
    pre.append(code);

    const content = document.createElement("code");
    content.classList.add("content");
    content.setAttribute("language", "katex");
    content.classList.add(`language-${node.attrs.language}`);
    try {
      katex.render(node.textContent, content)
    } catch(e) {
      // console.log(e, node.textContent)
    }

    wrapper.append(pre, content);
    dom.append(source, preview, multi, select, wrapper);

    content.classList.add("katex");

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

    const observer = new MutationObserver((mutations)=> {
      try {
        katex.render(node.textContent, content)
      } catch(e) {
        // console.log(e, node.textContent)
      }
    })
    observer.observe(pre, {
      characterDataOldValue : true,
      subtree : true,
    });
  }
  get dom(): Element {
    return this.component;
  }
  get contentDOM(): Element {
    return this.contentDOMElement
  }
   
  destroy() {
    this.component.dom.remove();
    this.component.contentDOM.remove();
  }
}