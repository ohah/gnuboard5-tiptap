import {
  Node,
  nodeInputRule,
  mergeAttributes,
} from '@tiptap/core'

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
    return ({HTMLAttributes, node}) => {
      const controlBar = [
        {element : document.createElement('div'), name : 'lt', x : true, y : true},
        {element : document.createElement('div'), name : 'ct', x : false, y : true},
        {element : document.createElement('div'), name : 'rt', x : true, y : true},
        {element : document.createElement('div'), name : 'rc', x : true, y : false},
        {element : document.createElement('div'), name : 'rb', x : true, y : true},
        {element : document.createElement('div'), name : 'cb', x : false, y : true},
        {element : document.createElement('div'), name : 'lb', x : true, y : true},
        {element : document.createElement('div'), name : 'lc', x : true, y : false},
      ]
      const { height, width, src } = mergeAttributes(HTMLAttributes, this.options.HTMLAttributes);
      const container = document.createElement('div');
      container.setAttribute("style", `height:${height}px;width:${width}px;`);
      container.addEventListener('click', (e)=>{
        container.className = "drag-image-resize";
        controlBar.map((row)=>{
          row.element = row.element.cloneNode(true) as HTMLDivElement;
          const resize = row.element;
          resize.className = `dir-circle dir-${row.name}`;
          resize.addEventListener("drag", (e:MouseEvent)=>{
            if(row.x === true) {
              container.style.width = `${e.x}px`;
              img.style.width = `${e.x}px`;
              HTMLAttributes.width = e.x;
              this.options.HTMLAttributes.width = e.x;
              node.attrs.width = e.x;
            }
            if(row.y) {
              container.style.height = `${e.y}px`;
              img.style.height = `${e.y}px`;
              HTMLAttributes.height = e.y;
              this.options.HTMLAttributes.height = e.y;
              node.attrs.height = e.y;
            }
          },false)
            // container.append(resize);
          container.append(row.element);
        })
      })
      const img = document.createElement('img');
      
      img.setAttribute("style", `height:${height}px;width:${width}px;`);
      img.setAttribute("src", src);
      container.append(img);
      return {
        dom: container,
      }
    }
  },
 
  onTransaction() {
    const container = this.editor.view.dom.querySelector('.drag-image-resize');
    if(container) {
      container.className = "";
      const dragOptions = this.editor.view.dom.querySelectorAll(".dir-circle");
      dragOptions.forEach(element => {
        container.removeChild(element);  
      });
    }
  },
  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

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
        default : 300
      },
      height : {
        default : 300
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