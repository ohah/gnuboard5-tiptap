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
    console.log('this', this);
    // const parentAttr = {
    //   ...HTMLAttributes,
    //   class : "drag-image-resize",
    // }
    // 'div', mergeAttributes(this.options.HTMLAttributes, parentAttr), 
    // ['div', {class : 'dir-circle dir-lt'}],
    // ['div', {class : 'dir-circle dir-ct'}],
    // ['div', {class : 'dir-circle dir-rt'}],
    // ['div', {class : 'dir-circle dir-rc'}],
    // ['div', {class : 'dir-circle dir-rb'}],
    // ['div', {class : 'dir-circle dir-cb'}],
    // ['div', {class : 'dir-circle dir-lb'}],
    // ['div', {class : 'dir-circle dir-lc'}],
    return ({HTMLAttributes}) => {
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
      const { height, width, src } = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
      const container = document.createElement('div');
      container.className = "drag-image-resize";
      container.setAttribute("style", `height:${height}px;width:${width}px;`);
      let selected;
      container.addEventListener('click', (e)=>{
        console.log(e);
        controlBar.forEach((row)=>{
          container.append(row.element);
        })
      })
      const img = document.createElement('img');
      controlBar.forEach(pos => {
        const resize = pos.element;
        resize.className = `dir-circle dir-${pos.name}`;
        resize.addEventListener("drag", (e)=>{
          if(pos.x === true) {
            container.style.width = `${e.x}px`;
            img.style.width = `${e.x}px`;
            HTMLAttributes.width = e.x;
            this.options.HTMLAttributes.width = e.x;
          }
          if(pos.y) {
            container.style.height = `${e.y}px`;
            img.style.height = `${e.y}px`;
            HTMLAttributes.height = e.y;
            this.options.HTMLAttributes.height = e.y;
          }
        })
        // container.append(resize);
      });
      img.setAttribute("style", `height:${height}px;width:${width}px;`);
      img.setAttribute("src", src);
      container.append(img);
      return {
        dom: container,
      }
    }
  },
 
  onTransaction() {
    // console.log('onTra')
  },
  onSelectionUpdate() {
    // console.log('onselect')
  },
  onUpdate() {
    // console.log("?")
  },
  
  onBlur() {
    // console.log('blur');
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
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, this.options.HTMLAttributes)]
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