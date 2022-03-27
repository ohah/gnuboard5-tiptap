import { Node, nodeInputRule, mergeAttributes, NodeViewRendererProps } from '@tiptap/core'
import { ImageResizeNodeView } from './ResizeNode'
import { NodeView as ProsemirrorNode, Decoration, DecorationSet } from "prosemirror-view";


export interface ImageOptions {
  inline: boolean,
  allowBase64: boolean,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      setImage: (options: { src: string, alt?: string, title?: string }) => ReturnType,
    }
  }
}

export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export const Image = Node.create<ImageOptions>({
  name: 'image',
  
  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

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
      const NodeView = new ImageResizeNodeView("", props)
      return {
        dom : NodeView.dom,
      }
    }
  },
 
  onTransaction() {
    const container = this.editor.view.dom.querySelector('.resizable');
    if(container) {
      container.classList.remove("resizable");
    }
  },
  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  // draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width : {
        default : null
      },
      height : {
        default : null
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
        attrs : mergeAttributes(this.options.HTMLAttributes),
      },
    ]
  },

  renderHTML({ HTMLAttributes,node }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, node.attrs)]
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => {
          const [,, alt, src, title, width , height ] = match

          return { src, alt, title, width, height }
        },
      }),
    ]
  },
})

export default Image;