import { NodeView, NodeViewRendererOptions, NodeViewRendererProps, Editor, EditorOptions } from "@tiptap/core";
import lowlight from "lowlight";

export class CodeBlockOptionsView extends NodeView<any, Editor, NodeViewRendererOptions> {
  
  contentDOMElement! : HTMLElement | null

  mount() {
    const { editor, node, getPos, decorations, updateAttributes, extension } = this;
    const languages = extension.options.lowlight.listLanguages();
    languages.push("mermaid");
    languages.push("katex");
    const select = document.createElement("select");
    select.contentEditable = "false";
    select.classList.add("lang-select");
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

    const pre = document.createElement("pre");
    pre.style.marginTop = "0";
    const code = document.createElement("div");
    code.classList.add(`language-${node.attrs.language}`);

    pre.setAttribute("language", `${node.attrs.language}`);
    pre.classList.add("code-block");
    pre.append(code);

    const content = document.createElement("code");
    content.setAttribute("language", `${node.attrs.language}`);
    content.classList.add(`language-${node.attrs.language}`);

    wrapper.append(pre, content);
    dom.append(select, wrapper);

    this.component = dom;
    this.contentDOMElement = pre;
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