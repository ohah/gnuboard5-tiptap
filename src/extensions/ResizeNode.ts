import { Editor, NodeView, NodeViewRendererOptions } from "@tiptap/react";
import { NodeView as ProsemirrorNode, Decoration, DecorationSet } from "prosemirror-view";

export class ImageResizeNodeView extends NodeView<any, Editor, NodeViewRendererOptions> {
  mount () {
    const { editor, node, getPos, decorations, updateAttributes, extension } = this;
    const img = document.createElement('img');
    img.src = node.attrs.src;
    img.onload = () => {
      if(node.attrs.width) {
        dom.style.width = `${node.attrs.width}px`;
      } else {
        dom.style.width = `${img.naturalWidth}px`;
      }
      if(node.attrs.height) {
        dom.style.height = `${node.attrs.height}px`;
      } else {
        dom.style.height = `${img.naturalHeight}px`;
      }
    }

    const dom = document.createElement('div');
    dom.classList.add("resize-image");

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === "style") {
          const { height , width } = this.component.style;
          this.node.attrs.width = width;
          this.node.attrs.height = height;
          dom.style.width = `${node.attrs.width}px`;
          dom.style.height = `${node.attrs.height}px`;
        }
      }
    });

    const init = () => {      
      dom.removeEventListener("click", init, false);
      if(dom.classList.contains("resizable")) {
        dom.classList.remove("resizable");
      } else {        
        dom.classList.add("resizable");
        observer.disconnect();
        observer.observe(dom, {
          attributes: true,
        });
      }
      dom.addEventListener("click", init, false);
    }

    dom.addEventListener("click", init, false);
    dom.append(img);
    this.component = dom;    
  }
  
  get dom(): Element {
    return this.component
  }

  
  // ignoreMutation(mutation: MutationRecord | { type: "selection"; target: Element; }): boolean {
  //   console.log(mutation)     
  //   return false;
  // }
}